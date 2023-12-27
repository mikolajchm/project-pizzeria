import { select, settings } from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget{
    constructor(element) {
      super(element, settings.amountWidget.defaultValue);

      const thisWidget = this;
  
      thisWidget.getElements(element);
      thisWidget.initActions();
      
      const initialValue = thisWidget.input.value !== '' ? thisWidget.input.value : settings.amountWidget.defaultValue;
  

      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.setValue(initialValue);
      
     //console.log('AmountWidget:', thisWidget);
     // console.log('constructor arguments:', element);
    }
  
    getElements(element) {
      const thisWidget = this;
  
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
      thisWidget.dom.input = thisWidget.input;
    }
  
    isValid(value){
      return !isNaN(value)
      && value >= settings.amountWidget.defaultMin
      && value <= settings.amountWidget.defaultMax;
    }

    renderValue(){
      const thisWidget = this;

      thisWidget.dom.input.value = thisWidget.value;
    }

  
    initActions() {
      const thisWidget = this;
  
      thisWidget.input.addEventListener('change', function(){
        // thisWidget.setValue(thisWidget.input.value);
        thisWidget.value = thisWidget.dom.input.value;
      });
  
      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
  
      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }

  
} 

export default AmountWidget;