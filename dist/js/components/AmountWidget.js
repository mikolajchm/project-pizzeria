import { select, settings } from '../settings.js';

class AmountWidget {
    constructor(element) {
      const thisWidget = this;
  
      thisWidget.getElements(element);
      thisWidget.initActions();
      
      const initialValue = thisWidget.input.value !== '' ? thisWidget.input.value : settings.amountWidget.defaultValue;
  
      thisWidget.setValue(initialValue);
      
      console.log('AmountWidget:', thisWidget);
      console.log('constructor arguments:', element);
    }
  
    getElements(element) {
      const thisWidget = this;
  
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
  
    setValue(value) {
      const thisWidget = this;
  
      const newValue = parseInt(value);
      const minValue = settings.amountWidget.defaultMin;
      const maxValue = settings.amountWidget.defaultMax;
    
     /* TODO: Add validation */
     
     if (!isNaN(newValue) && newValue >= minValue && newValue <= maxValue) {
      thisWidget.value = newValue;
  
      thisWidget.announce('valueChanged', { newValue: thisWidget.value });
     }
  
     thisWidget.input.value = thisWidget.value;
  
    } 
  
  
    initActions() {
      const thisWidget = this;
  
      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
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
  
  
    announce(){
      const thisWidget = this;
  
      const event = new CustomEvent('updated',{
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }
  
} 

export default AmountWidget;