Date.prototype.isSameDateAs = function(pDate) {
  return (
    this.getFullYear() === pDate.getFullYear() &&
    this.getMonth() === pDate.getMonth() &&
    this.getDate() === pDate.getDate()
  );
};

jQuery.fn.visible = function() {
    return this.css('visibility', 'visible');
};

jQuery.fn.invisible = function() {
    return this.css('visibility', 'hidden');
};

function App() {
  var self = this;
  var dateToday = new Date();
  var btClient;

  this.isFormValid = function(form, d) {
    var isValid = true;
    function isItemValid(element, value, isCustomValid, canBeEmpty) {
      if( !canBeEmpty && (value === "" || value === null) ||
          typeof isCustomValid !== 'undefined' && isCustomValid !== null && !isCustomValid(value, form) )
      {
        isValid = false;
        form.find(element).addClass("error");
        return false;
      } else {
        form.find(element).removeClass("error");
        return true;
      }
    }

    isItemValid('[name=customer-name]', d.name);
    isItemValid('[name=customer-phone]', d.phone, function(value) {
      return true;
    });
    isItemValid('[name=customer-email]', d.email, function(value) {
      return true;
    });

    isItemValid('[name=delivery-address]', d.address);
    // suite is optional
    isItemValid('[name=delivery-city]', d.city);
    isItemValid('[name=delivery-state]', d.state);
    isItemValid('[name=delivery-zip]', d.zip);

    isItemValid('[name=delivery-type]', d.delivery_type, function(value) {
      switch (value) {
        case "now": return true;
        case "later": return true;
        default: return false;
      }
    });
    isItemValid('[name=delivery-date]', d.delivery_date, function(value) {
      var date = new Date();
      for (var i = 0; i < 3; i++) {
        while((date.getDay() == 6) || (date.getDay() === 0)) {
          date.setDate(date.getDate() + 1);
        }
        console.log($.datepicker.formatDate("m-d-yy", date) + " " + value);
        if($.datepicker.formatDate("m-d-yy", date) == value) {
          return true;
        }

        date.setDate(date.getDate() + 1);
      }
      return false;
    });

    return isValid;
  };

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
      case 1:  return 3;
      case 2:  return 4;
      case 3:  return 5;
      case 4:  return 6;
      case 5:  return 7;
      case 6:  return 8;

      case 7:  return 10;
      case 8:  return 11;
      case 9:  return 12;
      case 10: return 13;
      case 11: return 14;
      case 12: return 15;

      case 13: return 17;
      case 14: return 18;
      case 15: return 19;
      case 16: return 20;
      case 17: return 21;
      case 18: return 22;

      case 19: return 24;
      case 20: return 25;
      case 21: return 26;
      case 22: return 27;
      case 23: return 28;
      case 24: return 29;
      default: return 0;
    }
  };

  this.quantityChanged = function(e, ev) {
    console.log("hey");
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

      if(isMultiple) {
        ctx.find("input[name=quantity]").val(ctx.find("input[name=quantity]").val() || cQ[key] || 6);
      }

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
      window.location = '/order';
    }

    // submit form
    var dataString = "action=product-add&itemId="+itemId+"&quantity="+quantity+"&_csrf="+ $("input[name=_csrf]").val();
    $.ajax({
      type: "POST",
      url: ctx.attr('action'),
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
      itemId = parseInt(tar.val());
    }

    tar.find('.fa-times').addClass('hide');
    tar.find('.fa-refresh').removeClass('hide');
    tar.prop("disabled",false);

    $('.confirm-order').prop("disabled", true);

    // submit form
    var dataString = "action=product-remove&itemId="+itemId+"&_csrf="+ $("input[name=_csrf]").val();
    $.ajax({
      type: "POST",
      url: ctx.attr('action'),
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

  this.populateSelectData = function(data, arr) {
    for(var i = 0; i < arr.length; i++) {
      data.add(arr[i]);
    }
  };

  this.populateDeliveryDates = function() {
    function dateString(date) {
      return {text: $.datepicker.formatDate("DD M d", date), value: $.datepicker.formatDate("m-d-yy", date)};
    }

    var date = new Date(dateToday);
    var dateStrings = [];
    while((date.getDay() == 6) || (date.getDay() === 0)) {
      date.setDate(date.getDate() + 1);
    }

    if(!dateToday.isSameDateAs(date)) {
      dateStrings[0] = dateString(date);
    } else if(date.getHours() < 23) {
      dateStrings[0] = {text: "Today", value: $.datepicker.formatDate("m-d-yy", date)};
    }

    do {
      date.setDate(date.getDate() + 1);
    } while((date.getDay() == 6) || (date.getDay() === 0));
    dateStrings[1] = dateString(date);

    do {
      date.setDate(date.getDate() + 1);
    } while((date.getDay() == 6) || (date.getDay() === 0));
    dateStrings[2] = dateString(date);

    return dateStrings;
  };

  this.populateDeliveryTimes = function(isToday) {
    var d = new Date(dateToday);
    var timeStrings = [];

    timeStrings[timeStrings.length] = {text: "Time?", disabled: true};

    if(d.getHours() < 20 || !isToday) {
      timeStrings[timeStrings.length] = {text: "8PM - 9PM", value: "8-9"};
    }
    if(d.getHours() < 21 || !isToday) {
      timeStrings[timeStrings.length] = {text: "9PM - 10PM", value: "9-10"};
    }
    if(d.getHours() < 22 || !isToday) {
      timeStrings[timeStrings.length] = {text: "10PM - 11PM", value: "10-11"};
    }
    if(d.getHours() < 23 || !isToday) {
      timeStrings[timeStrings.length] = {text: "11PM - 12AM", value: "11-12"};
    }

    return timeStrings;
  };

  this.deliveryTypeChanged = function() {
    if($("select.delivery-type").val() == "later") {
      $(".delivery-date-holder").show();
      if($("select.delivery-date").val()) {
        $(".delivery-time-holder").show();
      }
    } else {
      $(".delivery-date-holder").hide();
      $(".delivery-time-holder").hide();
    }
  };

  this.deliveryDateChanged = function() {
    $("select.delivery-time").data("selectBox-selectBoxIt").remove();
    var d = new Date($("select.delivery-date").val());
    var arr = self.populateDeliveryTimes(d.isSameDateAs(dateToday));

    self.populateSelectData($("select.delivery-time").data("selectBox-selectBoxIt"), arr);

    if($("select.delivery-date").val()) {
      $(".delivery-time-holder").show();
      $(document.body).trigger("sticky_kit:recalc");
    }
  };

  this.deliveryPaymentChanged = function() {
    if($("select.delivery-payment").val() == "credit-card") {
      $(".delivery-payment-form").show();
    } else {
      $(".delivery-payment-form").hide();
    }
    $(document.body).trigger("sticky_kit:recalc");
  };

  this.setupGateway = function() {
    $.ajax({
      type: "GET",
      url: '/order/clientToken',
      cache: false,
      success: function(token){
        self.btClient = new braintree.api.Client({clientToken: token});
      }
    });
  };

  this.placeOrder = function(ev) {
    ev.preventDefault();
    var form = $(ev.target);

    form.find('input, textarea, button, select').prop('disabled', true);

    form.find('button.confirm-order-btn').addClass('hide');
    form.find('.fa-refresh-div').removeClass('hide');

    var cData = {
      name: form.find('[name=customer-name]').val(),
      phone: form.find('[name=customer-phone]').val(),
      email: form.find('[name=customer-email]').val(),

      address: form.find('[name=delivery-address]').val(),
      suite: form.find('[name=delivery-suite]').val(),
      city: form.find('[name=delivery-city]').val(),
      state: form.find('[name=delivery-state]').val(),
      zip: form.find('[name=delivery-zip]').val(),
      notes: form.find('[name=delivery-notes-js]').val(),

      delivery_type: form.find('[name=delivery-type]').val() || "",
      delivery_date: form.find('[name=delivery-date]').val() || "",
      delivery_time: form.find('[name=delivery-time]').val() || ""
    };

    var error = !self.isFormValid(form, cData);

    if(error) {
      console.log("error!");

      form.find('input, textarea, button, select').prop('disabled', false);

      form.find('button.confirm-order-btn').removeClass('hide');
      form.find('.fa-refresh-div').addClass('hide');

      return;
    }

    var continueOrder = function(err, nonce) {

      cData.payment_method_nonce = nonce || "";

      var dataString =
        "action=checkout" +
        "name="+cData.name+
        "&phone="+cData.phone+
        "&email="+cData.email+

        "&address="+cData.address+
        "&suite="+cData.suite+
        "&city="+cData.city+
        "&state="+cData.state+
        "&zip="+cData.zip+
        "&note="+cData.notes+

        "&delivery_type="+cData.delivery_type+
        "&delivery_date="+cData.delivery_date+
        "&delivery_time="+cData.delivery_time+

        "&payment_method_nonce="+cData.payment_method_nonce+

        "&_csrf="+ form.find("input[name=_csrf]").val();

      $.ajax({
        type: "POST",
        url: form.attr('action'),
        data: dataString,
        cache: false,
        success: function(result){
          window.location = '/order/success';
        }
      });
    };

    // check if they are paying now
    if(!error && form.find('select[name=payment-type]').val() == 'credit-card') {
      var cardholder_name = form.find('input[data-braintree-name=cardholder_name]').val();
      var number = form.find('input[data-braintree-name=number]').val();
      var expiration_date = form.find('input[data-braintree-name=expiration_date]').val();
      var cvv = form.find('input[data-braintree-name=cvv]').val();

      // DO FUCKING VALIDATION

      self.btClient.tokenizeCard({
        number: number,
        cardholderName: cardholder_name,
        expirationDate: expiration_date,
        cvv: cvv
      }, continueOrder);
    } else if(!error) {
      continueOrder(null, null);
    }
  };

  this.resize = function() {
    if($(window).width() < 770) {
      $(".order-info, .order-recipt").trigger("sticky_kit:detach");
    } else {
      $(".order-info, .order-recipt").stick_in_parent({
        offset_top: 65
      });
    }
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

    this.quantityChanged();
  };

  this.initOrder = function() {
    $("select.delivery-type").selectBoxIt();
    $("select.delivery-date").selectBoxIt({
      populate: self.populateDeliveryDates
    });
    $("select.delivery-time").selectBoxIt();

    $("select.delivery-payment").selectBoxIt();

    $("select.delivery-type").bind("change", this.deliveryTypeChanged);
    $("select.delivery-date").bind("change", this.deliveryDateChanged);
    $("select.delivery-payment").bind("change", this.deliveryPaymentChanged);

    $(".product-remove").bind("click", this.productRemove);

    $("form.delivery-form").bind("submit", this.placeOrder);

    $(window).bind("resize", this.resize);

    this.setupGateway();
    this.deliveryTypeChanged();
    this.resize();
  };

  this.init = function() {
    $('.js-required').removeClass('js-required');

    if(window.location.pathname == "/shop") {
      this.initShop();
    } else if(window.location.pathname == "/order") {
      this.initOrder();
    }
  };
}


$(function() {
  var app = new App();
  app.init();
});
