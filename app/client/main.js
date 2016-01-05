var $ = require('jquery');
        require('jquery-ui');
        require('./lib/proto.util.js');
var order = require('./order');

function App() {
  var self = this;

  this.calcQuantity = function() {
    var keys = Object.keys(cQ);
    var total = 0;
    for (var i = 0; i < keys.length; i++) {
      total += cQ[keys[i]];
    }
    return total;
  };

  this.calcPrice = function(qt) {
    if(!parseInt(qt)) return 0;
    switch(parseInt(qt)) {
      case 0:  return 0;
      case 1:  return 2;
      case 2:  return 2.5;
      case 3:  return 3;
      case 4:  return 4;
      case 5:  return 5;
      case 6:  return 6;

      case 7:  return 7;
      case 8:  return 8;
      case 9:  return 9;
      case 10: return 10;
      case 11: return 11;
      case 12: return 12;

      case 13: return 13;
      case 14: return 14;
      case 15: return 15;
      case 16: return 16;
      case 17: return 17;
      case 18: return 18;

      case 19: return 19;
      case 20: return 20;
      case 21: return 21;
      case 22: return 22;
      case 23: return 23;
      case 24: return 24;
      default: return 0;
    }
  };

  /*this.calcPrice = function(qt) {
    if(!parseInt(qt)) return 0;
    switch(parseInt(qt)) {
      case 0:  return 0; // ~ 2
      case 1:  return 3;
      case 2:  return 4;
      case 3:  return 5;
      case 4:  return 6;
      case 5:  return 7;
      case 6:  return 8;

      case 7:  return 10; // ~ 3
      case 8:  return 11;
      case 9:  return 12;
      case 10: return 13;
      case 11: return 14;
      case 12: return 15;

      case 13: return 17; // ~ 3.50
      case 14: return 18;
      case 15: return 19;
      case 16: return 20;
      case 17: return 21;
      case 18: return 22;

      case 19: return 24; // ~ 4
      case 20: return 25;
      case 21: return 26;
      case 22: return 27;
      case 23: return 28;
      case 24: return 29;
      default: return 0;
    }
  };*/

  this.quantityChanged = function(e, ev) {
    var items, quant;
    var isMultiple = ev === undefined;

    if(!isMultiple) {
      items = $(ev.target).closest('.product-form');
    } else {
      items = $('.product-form');
    }

    items.each(function() {
      var ctx = $( this );
      var key = ctx.find("input[name=itemId]").val();

      var quant = ctx.find('input[name=quantity]').val();

      // update quantity buttons
      ctx.find('.quant-btn').removeClass('blue');
      ctx.find("button[value="+quant+"].quant-btn").addClass('blue');

      if(!parseInt(quant) || parseInt(quant) > 24 || parseInt(quant) < 1) {
        ctx.find('.product-add').prop("disabled", true);
        ctx.find('.product-add').addClass("disabled");
      } else {
        ctx.find('.product-add').prop("disabled", false);
        ctx.find('.product-add').removeClass("disabled");
      }

      // update total
      ctx.find(".product-price").html( "$"+self.calcPrice(quant) );
      // update button
      if(cQ[key] == quant) {
        ctx.find('.product-add').removeClass('red');
        ctx.find('.product-add').addClass('green');
        ctx.find('.checkout').removeClass('hide');
        ctx.find('.add').addClass('hide');
        ctx.find('.remove-btn').visible();
      } else {
        ctx.find('.product-add').removeClass('green');
        ctx.find('.product-add').addClass('red');
        ctx.find('.add').removeClass('hide');
        ctx.find('.checkout').addClass('hide');
        ctx.find('.remove-btn').invisible();
      }
    });
  };

  this.quantityButtonClicked = function(ev, obj) {
    ev.preventDefault();

    var ctx = $(ev.target).closest('.product-form');
    var qt = parseInt(ev.target.value);

    // update form quantity value
    ctx.find("input[name=quantity]").val(qt).trigger('change', [ev]);
  };

  this.quantityModify = function(ev, obj) {
    ev.preventDefault();

    var ctx = $(ev.target).closest('.product-form');
    var _q = parseInt(ctx.find("input[name=quantity]").val());
    var modifier = parseInt($(ev.target).closest('button').attr('data-modifier'));
    window.ev =ev;
    var quantity = _q;
    if(quantity && modifier) {
      quantity = _q + modifier;
    }

    if(!_q) {
      quantity = 6;
    } else if(quantity < 1) {
      quantity = 1;
    } else if(quantity > 24) {
      quantity = 24;
    }

    ctx.find("input[name=quantity]").val(quantity);
  };

  this.updateCQ = function(ct, quantity) {
    ct.each(function() {
      var ctx = $( this );
      if(quantity === 0) {
        if(typeof cQ !== 'undefined' && quantity !== null) delete cQ[parseInt(ctx.find("input[name=itemId]").val())];

        ctx.find('.product-add').addClass('red');
        ctx.find('.product-add').removeClass('green');
        ctx.find('.checkout').addClass('hide');
        ctx.find('.add').removeClass('hide');

        ctx.find('.remove-btn').invisible();
      } else {
        if(typeof cQ !== 'undefined' && quantity !== null) cQ[parseInt(ctx.find("input[name=itemId]").val())] = quantity;

        ctx.find('.product-add').removeClass('red');
        ctx.find('.product-add').addClass('green');
        ctx.find('.checkout').removeClass('hide');
        ctx.find('.add').addClass('hide');

        ctx.find('.remove-btn').visible();
      }
      if(typeof cQ !== 'undefined') {
        var total_quantity = self.calcQuantity();
        if(total_quantity === 0) {
          $('.checkout-btn').addClass('hide');
        } else {
          $('.checkout-btn').removeClass('hide');
        }

        $('.quantity').html(total_quantity);
      }
    });
  };

  this.productAdd = function(ev, obj) {
    ev.preventDefault();

    var ctx = $(ev.target).closest('.product-form');
    var quantity = parseInt(ctx.find("input[name=quantity]").val());
    var itemId = parseInt(ctx.find("input[name=itemId]").val());

    // make button have refresh element
    ctx.find('.product-add .fa-arrow-circle-right').addClass('hide');
    ctx.find('.product-add .fa-refresh').removeClass('hide');

    // disable quantity buttons
    ctx.find(".quant-btn").prop("disabled",true);

    if(cQ[parseInt(ctx.find("input[name=itemId]").val())] == quantity) {
      window.location = '/order/info';
    }

    // submit form
    var dataString = "itemId="+itemId+"&quantity="+quantity+"&_csrf="+ $("input[name=_csrf]").val();
    $.ajax({
      type: "POST",
      url: '/order/api/addProduct',
      data: dataString,
      cache: false,
      success: function(result){
        ctx.find('.product-add .fa-arrow-circle-right').removeClass('hide');
        ctx.find('.product-add .fa-refresh').addClass('hide');
        ctx.find(".quant-btn").prop("disabled",false);

        self.updateCQ(ctx, quantity);
      }
    });
  };

  this.productRemove = function(ev, obj) {
    ev.preventDefault();
    var ctx = $(ev.target).closest('.product-form');
    var tar = $(ev.target).closest('.product-remove');

    var itemId = parseInt(ctx.find("input[name=itemId]").val());
    if(isNaN(itemId)) {
      itemId = parseInt(tar.attr('data-id'));
    }

    tar.find('.fa-times').addClass('hide');
    tar.find('.fa-refresh').removeClass('hide');
    tar.prop("disabled",false);

    $('.confirm-order').prop("disabled", true);

    // submit form
    var dataString = "itemId="+itemId+"&_csrf="+ $("input[name=_csrf]").val();
    $.ajax({
      type: "POST",
      url: '/order/api/removeProduct',
      data: dataString,
      cache: false,
      success: function(result){
        $('.total-quantity').html(parseInt($('.total-quantity').html())-parseInt(tar.closest('.order-product').find('.order-product-quantity').html()));

        tar.closest('.order-product').remove();

        tar.find('.fa-times').removeClass('hide');
        tar.find('.fa-refresh').addClass('hide');

        self.updateCQ(ctx, 0);

        var total = 0;
        for (var i = 0; i < $('.the-real-price').length; i++) {
          total += parseInt($($('.the-real-price')[i]).html());
        }
        $('.total-price').html("$"+total);

        if($('.order-product').length === 0 ) {
          $('.emptycart').removeClass('hide');
          $('.confirm-order').addClass("disabled");
          $('.confirm-order').prop("disabled", true);
        } else {
          $('.confirm-order').prop("disabled", false);
        }
        $(document.body).trigger("sticky_kit:recalc");
      }
    });
  };

  this.initShop = function() {
    // input quantity
    $(".quantity-btn").bind("click", this.quantityModify);
    $("input[name=quantity]").bind("blur", this.quantityModify);

    $(".quantity-btn").bind("click", this.quantityChanged);
    $("input[name=quantity]").bind("keyup", this.quantityChanged);
    $("input[name=quantity]").bind("blur", this.quantityChanged);

    // button quantity
    $(".quant-btn").bind("click", this.quantityButtonClicked);
    $(".quant-btn").bind("click", this.quantityChanged);

    // product buttons
    $("[type=submit].product-add").bind("click", this.productAdd);
    $("[type=submit].product-remove").bind("click", this.productRemove);

    $('.product-form').each(function() {
      var ctx = $( this );
      var key = ctx.find("input[name=itemId]").val();

      ctx.find("input[name=quantity]").val(cQ[key] || ctx.find("input[name=quantity]").val() || 6);
    });

    this.quantityChanged();
  };

  this.init = function() {
    $('.js-required').removeClass('js-required');

    if(window.location.pathname == "/order/shop") {
      this.initShop();
    } else if(window.location.pathname == "/order/info") {
      order.init();
    }
  };
}

$(function() {
  var app = new App();
  app.init();
});
