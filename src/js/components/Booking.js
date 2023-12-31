import { select, templates, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js'; 
import HourPicker from './HourPicker.js'; 


class Booking {
    constructor(element) {
        const thisBooking = this;
        
        thisBooking.selectedTable = null;
        thisBooking.selectedStarters = [];

        thisBooking.render(element);
        thisBooking.initWidgets();
        thisBooking.getData();
        
        
    }

    getData(){
        const thisBooking = this;

        const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePickerWidget.minDate);
        const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePickerWidget.maxDate);

        const params = {
            booking: [
                startDateParam,
                endDateParam,
            ],
            
            eventsCurrent: [
                settings.db.notRepeatParam, 
                startDateParam, 
                endDateParam,
            ],
            
            eventsRepeat: [
                settings.db.repeatParam, 
                endDateParam,
            ],
        };

        //console.log('getData params', params);

        const urls = {
            booking:
              settings.db.url + '/' + settings.db.bookings 
                              + '?' +params.booking.join("&"),
            eventsCurrent:
              settings.db.url + '/' + settings.db.events 
                              + '?' + params.eventsCurrent.join("&"),
            eventsRepeat:
              settings.db.url + '/' + settings.db.events 
                              + '?' + params.eventsRepeat.join("&"),
        };

       // console.log('getData urls', urls);

        Promise.all([
            fetch(urls.booking),
            fetch(urls.eventsCurrent),
            fetch(urls.eventsRepeat),
          ])
            .then(function (allResponses) {
              const bookingsResponse = allResponses[0];
              const eventsCurrentResponse = allResponses[1];
              const eventsRepeatResponse = allResponses[2];
              return Promise.all([
                bookingsResponse.json(),
                eventsCurrentResponse.json(),
                eventsRepeatResponse.json(),
              ]);
            })
            .then(function ([bookings, eventsCurrent, eventsRepeat]) {
             //console.log(bookings);
             //console.log(eventsCurrent);
             //console.log(eventsRepeat);
             thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
            });
    }

    parseData(bookings, eventsCurrent, eventsRepeat){
        const thisBooking = this;

        thisBooking.booked = {};

        for(let item of bookings){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        for(let item of eventsCurrent){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        const minDate = thisBooking.datePickerWidget.minDate;
        const maxDate = thisBooking.datePickerWidget.maxDate;


        for(let item of eventsRepeat){
            if(item.repeat == 'daily'){
                for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
                    thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
                }
            }
        }

       //console.log('thisBooking.booked', thisBooking.booked);


       thisBooking.updateDOM();
    }
    
    makeBooked(date, hour, duration, table){
        const thisBooking = this;

        if(typeof thisBooking.booked[date] == 'undefined'){
            thisBooking.booked[date]= {};
        }

        const startHour = utils.hourToNumber(hour);
        
        for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
           // console.log('loop', hourBlock);
           if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
            thisBooking.booked[date][hourBlock]= [];
        }

        thisBooking.booked[date][hourBlock].push(table);
        }
    }

    updateDOM() {
        const thisBooking = this;
    
        thisBooking.date = thisBooking.datePickerWidget.value;
        thisBooking.hour = utils.hourToNumber(thisBooking.hourPickerWidget.value);
    
        let allAvailable = false;
    
        if (
          typeof thisBooking.booked[thisBooking.date] == 'undefined'
          ||
          typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
        ){
          allAvailable = true;
        }

        //reset tables
        if (thisBooking.selectedTable !== null) {
          const selectedTableElement = thisBooking.dom.wrapper.querySelector(
              '.' + classNames.booking.tableBooked + '.' + classNames.booking.selectTable
          );
  
          if (selectedTableElement !== null) {
              selectedTableElement.classList.remove(classNames.booking.selectTable);
              thisBooking.selectedTable = null;
          }
      }
    
        for (let table of thisBooking.dom.tables){
          let tableId = table.getAttribute(settings.booking.tableIdAttribute);
          if (!isNaN(tableId)) {
            tableId = parseInt(tableId);
          }
    
          if (
            !allAvailable 
            &&
            thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) 
          ) {
            table.classList.add(classNames.booking.tableBooked);
          } else {
            table.classList.remove(classNames.booking.tableBooked);
          }
        }
    }



    render(element) {
      const thisBooking = this;
    
      const generatedHTML = templates.bookingWidget();
    
      thisBooking.dom = {};
      thisBooking.dom.wrapper = element;
      thisBooking.dom.wrapper.innerHTML = generatedHTML;
    
      thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);
      thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);
    
      thisBooking.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper);
      thisBooking.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper);
    
      thisBooking.dom.tablesContainer = element.querySelector(select.booking.tablesContainer);
      thisBooking.dom.tables = element.querySelectorAll(select.booking.tables);
      
      thisBooking.dom.phone = element.querySelector(select.booking.phone);
      thisBooking.dom.bookTable = element.querySelector(select.booking.bookTable);
      thisBooking.dom.form = element.querySelector(select.booking.form);
      thisBooking.dom.address = element.querySelector(select.booking.address);
      thisBooking.dom.starters = element.querySelectorAll(select.booking.starters);
    
      
    }

    initTables() {
      const thisBooking = this;
  
      thisBooking.dom.tablesContainer.addEventListener('click', function (event) {
        event.preventDefault();
        const clickedElement = event.target;
  
        if (clickedElement.classList.contains(classNames.booking.table)) {
          const tableId = parseInt(clickedElement.getAttribute(settings.booking.tableIdAttribute));
  
          if (!clickedElement.classList.contains(classNames.booking.tableBooked)) {
        
            // Sprawdzamy, czy stolik jest dostępny
            if (!clickedElement.classList.contains(classNames.booking.selectTable)) {
              // Zdejmujemy klasę selected ze starego stolika, jeśli taki był
              thisBooking.resetTable();
  
              // Zaznaczamy nowy stolik
              clickedElement.classList.add(classNames.booking.selectTable);
  
              // Zapisujemy numer nowego stolika w instancji Booking
              thisBooking.selectedTable = tableId;
            } else {
              // Zdejmujemy klasę selected ze starego stolika
              thisBooking.resetTable();
            }
          } else {
            alert('Stolik jest już zajęty. Wybierz inny.');
          }
        }
      });
    }
  
    resetTable() {
      const thisBooking = this;
  
      // Zdejmujemy klasę selected ze starego stolika
      const selectedTableElement = thisBooking.dom.wrapper.querySelector(select.booking.tableSelected);
      if (selectedTableElement !== null) {
        selectedTableElement.classList.remove(classNames.booking.selectTable);
      }
  
      // Resetujemy numer wybranego stolika
      thisBooking.selectedTable = null;
    }

  initWidgets() {
    const thisBooking = this;

    // Create new instances of AmountWidget
    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePickerWidget = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPickerWidget = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.initTables(); 

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.resetTable();
      thisBooking.updateDOM();
    });

  }

  getStarters() {
    const thisBooking = this;
    const starters = [];

    for (let starter of thisBooking.dom.starters) {
        if (starter.checked) {
            starters.push(starter.value);
        }
    }

    return starters;
  }

    
  sendBooking() {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.bookings;

    const payload = {
      date: thisBooking.datePickerWidget.value,
      hour: thisBooking.hourPickerWidget.value,
      table: thisBooking.selectedTable,
      duration: thisBooking.hoursAmountWidget.value,
      ppl: thisBooking.peopleAmountWidget.value,
      starters: thisBooking.getStarters(),
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    };
    
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(response => response.json())
      .then(parsedResponse => {
        console.log('Booking sent:', parsedResponse);
        // Dodajemy nową rezerwację do thisBooking.booked
        thisBooking.makeBooked(
          parsedResponse.date,
          parsedResponse.hour,
          parsedResponse.duration,
          parsedResponse.table
        );
        // Aktualizujemy widok
        thisBooking.updateDOM();
        // Resetujemy wybór stolika
        thisBooking.resetTable();
      });
  }

}

export default Booking;