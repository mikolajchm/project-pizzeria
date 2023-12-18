import { select, classNames, templates } from '../settings.js'; 
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product {
    constructor(id, data) {
      const thisProduct = this;
  
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.dom = {}; 
  
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
  
      console.log('new Product:', thisProduct);
    }
  
    renderInMenu() {
      const thisProduct = this;
  
      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
  
      /* create element using utils.createElementFromHTML */
      thisProduct.dom.element = utils.createDOMFromHTML(generatedHTML);
  
      /* Find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
  
      /* add element to menu */
      menuContainer.appendChild(thisProduct.dom.element);
    }
  
    getElements() {
      const thisProduct = this;
  
      thisProduct.dom.accordionTrigger = thisProduct.dom.element.querySelector(select.menuProduct.clickable);
      thisProduct.dom.form = thisProduct.dom.element.querySelector(select.menuProduct.form);
      thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
      thisProduct.dom.cartButton = thisProduct.dom.element.querySelector(select.menuProduct.cartButton);
      thisProduct.dom.priceElem = thisProduct.dom.element.querySelector(select.menuProduct.priceElem);
      thisProduct.dom.imageWrapper = thisProduct.dom.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.dom.amountWidgetElem = thisProduct.dom.element.querySelector(select.menuProduct.amountWidget);
     
    }
  
    initAccordion() {
      const thisProduct = this;
  
      /* find the clickable trigger (the element that should react to clicking) */
      thisProduct.dom.accordionTrigger.addEventListener('click', function (event) {
  
        /* prevent default action for event */
        event.preventDefault();
  
        /* find active product (product that has active class) */
        const activeProduct = document.querySelector(select.all.menuProductsActive);
  
        /* if there is an active product and it's not thisProduct.dom.element, remove class active from it */
        if (activeProduct !== null && activeProduct !== thisProduct.dom.element) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }
  
        /* toggle active class on thisProduct.dom.element */
        thisProduct.dom.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }
  
    initOrderForm() {
      const thisProduct = this;
      console.log('initOrderForm method');
      thisProduct.dom.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });
  
      for (let input of thisProduct.dom.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }
  
      thisProduct.dom.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }
  
    processOrder() {
      const thisProduct = this;
  
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      console.log('formData', formData);
  
      // set price to default price
      let price = thisProduct.data.price;
  
      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        console.log(paramId, param);
  
        // for every option in this category
        for (let optionId in param.options) {
          // Determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          console.log(optionId, option);
  
          // Find the image with the class .paramId-optionId in the imageWrapper
          const optionImage = thisProduct.dom.imageWrapper.querySelector(`.${paramId}-${optionId}`);
  
          // Check if the image exists
          if (optionImage) {
            // Check if the option is selected
            const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
  
            // Apply changes to the image visibility using a class
            if (optionSelected) {
              optionImage.classList.add('active');
            } else {
              optionImage.classList.remove('active');
            }
  
            // Adjust the price based on the option state
            if (!option.default && optionSelected) {
              // Add option price to price variable
              price += option.price;
            } else if (option.default && !optionSelected) {
              // Reduce price variable
              price -= option.price;
            }
          }
        }
      }
  
      // assign the calculated price to the new property priceSingle
      thisProduct.priceSingle = price;
      /* multiply price by amount */
      price *= thisProduct.amountWidget.value;
  
      // update calculated price in the HTML
      thisProduct.dom.priceElem.innerHTML = price;
    }
  
    initAmountWidget() {
      const thisProduct = this;
  
      thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
  
      thisProduct.dom.amountWidgetElem.addEventListener('updated', function () {
        thisProduct.processOrder();
      });
    }
  
    addToCart() {
        const thisProduct = this;
     
        //  app.cart.add(thisProduct.prepareCartProduct());
        const event = new CustomEvent('add-to-cart', {
          bubbles: true,
          detail: {
            product: thisProduct.prepareCartProduct(),
          },
        }
        );
        thisProduct.element.dispatchEvent(event);
    }
  
    prepareCartProduct() {
      const thisProduct = this;
    
      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.priceSingle * thisProduct.amountWidget.value,
        params: thisProduct.prepareCartProductParams(),
      };
    
      console.log('productSummary', productSummary);
      return productSummary;
    }
  
    prepareCartProductParams() {
      const thisProduct = this;
    
      // Convert form to object structure, e.g., { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
    
      const params = {};
    
      // For every category (param)...
      for (let paramId in thisProduct.data.params) {
        // Determine param value, e.g., paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        params[paramId] = {
          label: param.label,
          options: {},
        };
    
        // For every option in this category
        for (let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected =
            formData[paramId] && formData[paramId].includes(optionId);
          if (optionSelected) {
            params[paramId].options[optionId] = option.label;
          }
        }
      }
    
      return params;
    }
  
}

export default Product;