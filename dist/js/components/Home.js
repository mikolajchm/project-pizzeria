import { templates } from "../settings.js";
import utils from "../utils.js";


class Home {
    constructor(element) {
        const thisHome = this;
        thisHome.render(element);
        thisHome.initOrderButton();
    }

    render(element) {
        const thisHome = this;

        thisHome.dom = {};
        thisHome.dom.wrapper = element;


        // Użyj szablonu do generowania HTML
        const generatedHTML = templates.home();

        // Utwórz DOM z wygenerowanego HTML i dodaj go do wrappera
        const generatedDOM = utils.createDOMFromHTML(generatedHTML);
        thisHome.dom.wrapper.appendChild(generatedDOM);

        

   
    }
    
    initOrderButton() {
        const thisHome = this;

        thisHome.dom.orderButton = thisHome.dom.wrapper.querySelector('.home-pic a[href="#order"]');

        if (thisHome.dom.orderButton) {
            thisHome.dom.orderButton.addEventListener('click', function (event) {
                event.preventDefault();
                window.location.hash = '#order';
            });
        }
    }

   
}

export default Home;