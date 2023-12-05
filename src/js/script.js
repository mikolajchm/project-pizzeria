/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', 
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', 
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  cart: {
    productList: '.cart__order-summary',
    toggleTrigger: '.cart__summary',
    totalNumber: `.cart__total-number`,
    totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
    subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
    deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
    form: '.cart__order',
    formSubmit: '.cart__order [type="submit"]',
    phone: '[name="phone"]',
    address: '[name="address"]',
  },
  cartProduct: {
    amountWidget: '.widget-amount',
    price: '.cart__product-price',
    edit: '[href="#edit"]',
    remove: '[href="#remove"]',
  },

};

const classNames = {
  menuProduct: {
    wrapperActive: 'active',
    imageVisible: 'active',
  },
  cart: {
    wrapperActive: 'active',
  },
  
};

const settings = {
  amountWidget: {
    defaultValue: 1,
    defaultMin: 1,
    defaultMax: 9,
  }, 
  cart: {
    defaultDeliveryFee: 20,
  },
  
};

const templates = {
  menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  
};

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
    /* multiply price by amount */
    price *= thisProduct.amountWidget.value;

    // assign the calculated price to the new property priceSingle
    thisProduct.priceSingle = price;

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

  addToCart(){
    const thisProduct = this; 
    const productSummary = thisProduct.prepareCartProduct();

    app.cart.add(productSummary);
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

    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    const params = {};
  
    // for every category (param)...
    for (let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];
      
  
      // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
      params[paramId] = {
        label: param.label,
        options: {}
      };
  
      // for every option in this category
      for (let optionId in param.options) {
        // Determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
  
        // Check if the option is selected
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
  
        // Add option to params if selected
        if (optionSelected) {
          params[paramId].options[optionId] = {
            label: option.label,
            price: option.price,
          };
        }
      }
    }
  
    return params;
  }

}
  
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

    const event = new Event('updated');
    thisWidget.element.dispatchEvent(event);
  }

} 

class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();

    console.log('new Cart',  thisCart);
  }

  getElements(element){
    const thisCart = this;

    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productListWrapper = thisCart.dom.wrapper.querySelector(select.cart.productListWrapper);
  }

  initActions(){
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function () {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    
  }

  add(menuProduct) {
    const thisCart = this;
  
  
    /* generate HTML based on template */
    const generatedHTML = templates.cartProduct(menuProduct);
  
    /* create element using utils.createElementFromHTML */
    thisCart.dom.element = utils.createDOMFromHTML(generatedHTML);
  
    /* add element to thisCart.dom.productList */
    thisCart.dom.productListWrapper.appendChild(generatedDOM);
  }

};

  const app = {
    initMenu: function () {
      const thisApp = this;
  
      console.log('thisApp.data:', thisApp.data);
  
      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },
  
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },

    initCart: function(){
      const thisApp = this; 

      
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);   
    },

  };

  app.init();
  
}
