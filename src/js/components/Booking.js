import { select, templates, settings} from '../settings.js';
import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from './DatePicker.js'; 
import HourPicker from './HourPicker.js'; 


class Booking {
    constructor(element) {
        const thisBooking = this;
        
        thisBooking.render(element);
        thisBooking.initWidgets();
        thisBooking.getData();
    }

    getData(){
        const thisBooking = this;

        const startDateParam = settings.db.dateStartParamKey + "=" + utils.dateToStr(thisBooking.datePicker.minDate);
        const endDateParam = settings.db.dateEndParamKey + "=" + utils.dateToStr(thisBooking.datePicker.maxDate);

        const params = {
            bookings: [
                startDateParam,
                endDateParam
            ],
            
            eventsCurrent: [
                settings.db.notRepeatParam, 
                startDateParam, endDateParam
            ],
            
            eventsRepeat: [
                settings.db.repeatParam, 
                endDateParam
            ],
        };

        console.log('getData params', params);

        const urls = {
            bookings:
              settings.db.url + "/" + settings.db.bookings 
                              + "?" +params.bookings.join("&"),
            eventsCurrent:
              settings.db.url + "/" + settings.db.events 
                              + "?" + params.eventsCurrent.join("&"),
            eventsRepeat:
              settings.db.url + "/" + settings.db.events 
                              + "?" + params.eventsRepeat.join("&"),
        };

        // console.log('getData urls', urls)

        Promise.all([
            fetch(urls.bookings),
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
             console.log(bookings);
             console.log(eventsCurrent);
             console.log(eventsRepeat);
            });
    }
    
    render(element) {
        const thisBooking = this;

        const generatedHTML = templates.bookingWidget();
        
        // Create element using utils.createDOMFromHTML
        thisBooking.dom = {};
        thisBooking.dom.wrapper = element;
        thisBooking.dom.wrapper.innerHTML = generatedHTML;
    
        // Add new properties to dom object
        thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);

        thisBooking.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper);
        thisBooking.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper);
    }

    initWidgets() {
        const thisBooking = this;
    
        // Create new instances of AmountWidget
        thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);

        thisBooking.datePickerWidget = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPickerWidget = new HourPicker(thisBooking.dom.hourPicker);
    }

}

export default Booking;