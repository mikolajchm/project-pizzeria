import {select, classNames, templates, settings} from './settings.js';
import CartProduct from './CartProduct.js';
import utils from './utils.js';

class Cart{
    constructor(element){
      const thisCart = this;
  
      thisCart.products = [];
      this.deliveryFee = settings.cart.defaultDeliveryFee;
      this.totalNumber = 0;
      this.subtotalPrice = 0;
      this.totalPrice = 0;
  
      thisCart.getElements(element);
      thisCart.initActions();
      
      
    }
  
    getElements(element){
      const thisCart = this;
  
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    
    }
  
    initActions(){
      const thisCart = this;
  
      thisCart.dom.toggleTrigger.addEventListener('click', function () {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
  
      thisCart.dom.productList.addEventListener('updated',function(){
        thisCart.update();
      });
  
      thisCart.dom.productList.addEventListener("remove", function (event) {
        thisCart.remove(event.detail.cartProduct);
      });
  
      thisCart.dom.form.addEventListener("submit", function (event) {
        event.preventDefault();
        thisCart.sendOrder();
      });
  
    }
  
    add(menuProduct) {
      const thisCart = this;
  
        const generatedHTML = templates.cartProduct(menuProduct);
  
        const generatedDOM = utils.createDOMFromHTML(generatedHTML);
  
        thisCart.dom.productList.appendChild(generatedDOM);
  
        thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
        console.log('thisCart.products', thisCart.products);
  
        thisCart.update();
        
    }
  
    update(){
      const thisCart = this;
      const deliveryFee = settings.cart.defaultDeliveryFee;
    
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;
    
      for (let product of thisCart.products) {
        thisCart.totalNumber += product.amount;
        thisCart.subtotalPrice += product.price;
      }
    
      if (thisCart.totalNumber > 0) {
        thisCart.totalPrice = thisCart.subtotalPrice + deliveryFee;
      } else {
        thisCart.totalPrice = 0;
      }
    
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    
      for (let domTotalPrice of thisCart.dom.totalPrice) {
        domTotalPrice.innerHTML = thisCart.totalPrice;
      }
    }
  
    remove(cartProduct){
      const thisCart = this;
  
      const indexOfProduct = thisCart.products.indexOf(cartProduct);
      thisCart.products.splice(indexOfProduct, 1);
  
      cartProduct.dom.wrapper.remove();
      thisCart.update();
    }
  
    sendOrder() {
      const thisCart = this;
  
      const url = settings.db.url + '/' + settings.db.orders;
  
      const payload = {
        address: thisCart.dom.address.value,
        phone: thisCart.dom.phone.value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: settings.cart.defaultDeliveryFee,
        products: [],
      };
      
      console.log("payload", payload);
      
      for (let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }
    
      const options = {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(payload),
      };
      fetch(url, options);
  }
}

export default Cart;


