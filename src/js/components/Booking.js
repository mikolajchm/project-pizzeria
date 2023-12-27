import { select, templates,} from '../settings.js';
import AmountWidget from "./AmountWidget.js";
import DatePicker from './DatePicker.js'; 
import HourPicker from './HourPicker.js'; 


class Booking {
    constructor(element) {
        const thisBooking = this;
        
        thisBooking.render(element);
        thisBooking.initWidgets();
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