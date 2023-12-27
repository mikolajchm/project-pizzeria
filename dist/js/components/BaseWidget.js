class BaseWidget{
    constructor(wrapperElement, initialValue){
        const thisWidget = this;

        thisWidget.dom = {};
        thisWidget.dom.wrapper = wrapperElement;
        thisWidget.dom.input = null;

        thisWidget.correctValue = initialValue;


    }

    get value(){
        const thisWidget = this;


        return thisWidget.correctValue;
    }


    set value(value) {
        const thisWidget = this;
    
        const newValue = thisWidget.parseValue(value);
      
       if (newValue != thisWidget.coorectValue && thisWidget.isValid(newValue)) {
        thisWidget.coorectValue = newValue;
    
        thisWidget.announce('valueChanged', { newValue: thisWidget.coorectValue });
       }
    
       thisWidget.renderValue();
    
    } 

    setValue(value){
        const thisWidget = this;

        thisWidget.value = value; 
    }

    parseValue(value){
        return parseInt(value);
    }
  
    isValid(value){
        return !isNaN(value);
    }

    renderValue(){
        const thisWidget = this;
  
        thisWidget.dom.wrapper.innerHTML = thisWidget.value;
    }

    announce(){
        const thisWidget = this;
    
        const event = new CustomEvent('updated',{
          bubbles: true
        });
        thisWidget.element.dispatchEvent(event);
    }
} 

export default BaseWidget;