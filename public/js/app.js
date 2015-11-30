Date.prototype.isSameDateAs = function(pDate) {
  return (
    this.getFullYear() === pDate.getFullYear() &&
    this.getMonth() === pDate.getMonth() &&
    this.getDate() === pDate.getDate()
  );
};

function App() {
  var self = this;
  var dateToday = new Date();
  var btClient;

  this.calcQuantity = function() {
    var keys = Object.keys(cQ);
    var total = 0;
    for (var i = 0; i < keys.length; i++) {
      total += cQ[keys[i]];
    }
    return total;
  };

  this.calcPrice = function(qt) {
    return (qt === 0 ? 0 : Math.floor( ((qt*1.3)+1.5) - qt/8 ));
  };

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
      var key = ctx.attr('data-id');

      if(isMultiple) {
        ctx.find("input[name=quantity]").val(cQ[key] || ctx.find("input[name=quantity]").val());
      }

      var quant = ctx.find('input[name=quantity]').val();

      // update quantity buttons
      ctx.find('.quant-btn').removeClass('blue');
      ctx.find("button[value="+quant+"].quant-btn").addClass('blue');

      // update total
      ctx.find(".product-price").html( "$"+self.calcPrice(quant) );

      // update button
      if(cQ[key] == quant) {
        ctx.find('.product-add').removeClass('red');
        ctx.find('.product-add').addClass('green');
        ctx.find('.checkout').removeClass('hide');
        ctx.find('.add').addClass('hide');
      } else {
        ctx.find('.product-add').removeClass('green');
        ctx.find('.product-add').addClass('red');
        ctx.find('.add').removeClass('hide');
        ctx.find('.checkout').addClass('hide');
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

  this.productAdd = function(ev, obj) {
    ev.preventDefault();

    var ctx = $(ev.target).closest('.product-form');
    var quantity = parseInt(ctx.find("input[name=quantity]").val());

    if(cQ[parseInt(ctx.attr('data-id'))] == quantity) {
      window.location = '/order';
    }

    // make button have refresh element
    ctx.find('.fa-arrow-circle-right').addClass('hide');
    ctx.find('.fa-refresh').removeClass('hide');

    // disable quantity buttons
    ctx.find(".quant-btn").prop("disabled",true);

    // submit form
    var dataString = "quantity="+quantity+"&_csrf="+ $("input[name=_csrf]").val();
    $.ajax({
      type: "POST",
      url: ctx.attr('action'),
      data: dataString,
      cache: false,
      success: function(result){
        ctx.find('.fa-arrow-circle-right').removeClass('hide');
        ctx.find('.fa-refresh').addClass('hide');
        ctx.find(".quant-btn").prop("disabled",false);

        cQ[parseInt(ctx.attr('data-id'))] = quantity;

        ctx.find('.product-add').removeClass('red');
        ctx.find('.product-add').addClass('green');
        ctx.find('.checkout').removeClass('hide');
        ctx.find('.add').addClass('hide');

        $('.quantity').html(self.calcQuantity());
        $('.checkout-btn').removeClass('hide');
      }
    });
  };

  this.productRemove = function(ev, obj) {
    ev.preventDefault();

    var tar = $(ev.target).closest('.product-remove');

    tar.find('.fa-times').addClass('hide');
    tar.find('.fa-refresh').removeClass('hide');
    tar.prop("disabled",false);

    // submit form
    var dataString = "removeItem="+tar.val()+"&_csrf="+ $("input[name=_csrf]").val();
    $.ajax({
      type: "POST",
      url: "/order/removeProduct",
      data: dataString,
      cache: false,
      success: function(result){
        tar.closest('.order-product').remove();

        $('.total-quantity').html(parseInt($('.total-quantity').html())-parseInt(tar.closest('.order-product').find('.order-product-quantity').html()));

        var total = 0;
        for (var i = 0; i < $('.the-real-price').length; i++) {
          total += parseInt($($('.the-real-price')[i]).html());
        }
        $('.total-price').html("$"+total);

        if($('.order-product').length === 0 ) {
          $('.emptycart').removeClass('hide');
          $('.confirm-order').addClass("disabled");
          $('.confirm-order').prop("disabled",true);
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
    var date = new Date(dateToday);
    var dateStrings = [];
    while((date.getDay() == 6) || (date.getDay() === 0)) {
      date.setDate(date.getDate() + 1);
    }
    if(date.getHours() < 23) {
      dateStrings[0] = {text: "Today", value: date.toISOString()};
    }
    do {
      date.setDate(date.getDate() + 1);
    } while((date.getDay() == 6) || (date.getDay() === 0));
    dateStrings[1] = {text: $.datepicker.formatDate("DD M d", date), value: date.toISOString()};
    do {
      date.setDate(date.getDate() + 1);
    } while((date.getDay() == 6) || (date.getDay() === 0));
    dateStrings[2] = {text: $.datepicker.formatDate("DD M d", date), value: date.toISOString()};

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
      $("span.delivery-date").show();
      if($("select.delivery-date").val()) {
        $("span.delivery-time").show();
      }
    } else {
      $("span.delivery-date").hide();
      $("span.delivery-time").hide();
    }
  };

  this.deliveryDateChanged = function() {
    $("select.delivery-time").data("selectBox-selectBoxIt").remove();
    var d = new Date($("select.delivery-date").val());
    var arr = self.populateDeliveryTimes(d.isSameDateAs(dateToday));

    self.populateSelectData($("select.delivery-time").data("selectBox-selectBoxIt"), arr);

    if($("select.delivery-date").val()) {
      $("span.delivery-time").show();
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
    console.log(0);
    $.ajax({
      type: "GET",
      url: '/order/clientToken',
      cache: false,
      success: function(token){
        console.log(token);
        self.btClient = new braintree.api.Client({clientToken: token});
      }
    });
  };

  this.placeOrder = function(ev) {
    ev.preventDefault();
    var form = $(ev.target);

    form.find('button.confirm-order-btn').prop('disabled', true);

    var continueOrder = function(err, nonce) {
      var cData = {
        name: form.find('[name=customer-name]').val(),
        phone: form.find('[name=customer-phone]').val(),

        address: form.find('[name=delivery-address]').val(),
        suite: form.find('[name=delivery-suite]').val(),
        city: form.find('[name=delivery-city]').val(),
        state: form.find('[name=delivery-state]').val(),
        zip: form.find('[name=delivery-zip]').val(),
        notes: form.find('[name=delivery-notes-js]').val(),

        delivery_type: form.find('[name=delivery-type]').val() || "",
        delivery_date: form.find('[name=delivery-date]').val() || "",
        delivery_time: form.find('[name=delivery-time]').val() || "",

        payment_method_nonce: nonce || ""
      };

      var dataString =
        "name="+cData.name+
        "&phone="+cData.phone+

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
    if(form.find('select[name=payment-type]').val() == 'credit-card') {

      var cardholder_name = form.find('input[data-braintree-name=cardholder_name]').val();
      var number = form.find('input[data-braintree-name=number]').val();
      var expiration_month = form.find('input[data-braintree-name=expiration_month]').val();
      var expiration_year = form.find('input[data-braintree-name=expiration_year]').val();
      var cvv = form.find('input[data-braintree-name=cvv]').val();
      var postal_code = form.find('input[data-braintree-name=postal_code]').val();

      // DO FUCKING VALIDATION

      self.btClient.tokenizeCard({
        number: number,
        cardholderName: cardholder_name,
        expirationMonth: expiration_month,
        expirationYear: expiration_year,
        cvv: cvv,
        billingAddress: {
          postalCode: postal_code
        }
      }, continueOrder);
    } else {
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
    $(".quant-btn").bind("click", this.quantityButtonClicked);
    $("[type=submit].product-add").bind("click", this.productAdd);
    $("input[name=quantity]").bind("change", this.quantityChanged);

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

    $("[type=submit].product-remove").bind("click", this.productRemove);

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
