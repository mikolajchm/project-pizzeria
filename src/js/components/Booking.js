import { select, templates,} from '../settings.js';
import AmountWidget from "./AmountWidget.js";


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
    }

    initWidgets() {
        const thisBooking = this;
    
        // Create new instances of AmountWidget
        thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    }

}

export default Booking;