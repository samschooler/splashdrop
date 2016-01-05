var $ = require('jquery');
        require('jquery-ui');
        require('./lib/jquery.sticky-kit.js');
        require('./lib/jquery.selectBoxIt.js');

var validation = require('./validation');

var cart = {};

var btClient;
var dateToday = new Date();

function isFormValid(form, d) {
  form.find('.error').removeClass('error');

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

  isItemValid('[name=customer-first-name]', d.first_name);
  isItemValid('[name=customer-last-name]', d.last_name);
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

  if(form.find('select[name=delivery-type]').val() == "later" &&
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
    })) {
    isItemValid('[name=delivery-time]', d.delivery_time, function(value) {
      switch (value) {
        case "8-9": return true;
        case "9-10": return true;
        case "10-11": return true;
        case "11-12": return true;
        default: return false;
      }
    });
  }

  if(form.find('[name=payment-type]').val() == "credit-card") {
    isItemValid('input[data-braintree-name=cardholder_name]', form.find('input[data-braintree-name=cardholder_name]').val());
    isItemValid('input[data-braintree-name=number]', form.find('input[data-braintree-name=number]').val(), validation.isCreditCardValid);
    isItemValid('input[data-braintree-name=expiration_date]', form.find('input[data-braintree-name=expiration_date]').val(), validation.isExpirationDateValid);
    isItemValid('input[data-braintree-name=cvv]', form.find('input[data-braintree-name=cvv]').val(), validation.isCVVValid);
  }

  return isValid;
}

function productRemove(ev, obj) {
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

      var total = 2;
      for (var i = 0; i < $('.the-real-price').length-1; i++) {
        total += parseInt($($('.the-real-price')[i]).html());
      }
      $('.total-price').html("$"+total);

      if($('.order-product').length === 1 ) {
        $('.con-fee').addClass('hide');
        $('.emptycart').removeClass('hide');
        $('.total-price').html("$0");
        $('.confirm-order').addClass("disabled");
        $('.confirm-order').prop("disabled", true);
      } else {
        $('.confirm-order').prop("disabled", false);
      }
      $(document.body).trigger("sticky_kit:recalc");
    }
  });
}

function sticky() {
  if($(window).width() < 770) {
    $(".order-info, .order-recipt").trigger("sticky_kit:detach");
  } else {
    $(".order-info, .order-recipt").stick_in_parent({
      offset_top: 65
    });
  }
}

function populateSelectData(data, arr) {
  for(var i = 0; i < arr.length; i++) {
    data.add(arr[i]);
  }
}

function populateDeliveryDates() {
  function dateString(date) {
    return {text: $.datepicker.formatDate("DD M d", date), value: $.datepicker.formatDate("m-d-yy", date)};
  }

  var date = new Date(dateToday);
  var dateStrings = [];
  while((date.getDay() == 6) || (date.getDay() === 0)) {
    date.setDate(date.getDate() + 1);
  }

  if(!dateToday.isSameDateAs(date)) {
    dateStrings[dateStrings.length] = dateString(date);
  } else if((date.getHours() < 23) || (date.getHours() < 23 && date.getMinutes() < 20)) {
    dateStrings[dateStrings.length] = {text: "Today", value: $.datepicker.formatDate("m-d-yy", date)};
  }

  do {
    date.setDate(date.getDate() + 1);
  } while((date.getDay() == 6) || (date.getDay() === 0));
  dateStrings[dateStrings.length] = dateString(date);

  do {
    date.setDate(date.getDate() + 1);
  } while((date.getDay() == 6) || (date.getDay() === 0));
  dateStrings[dateStrings.length] = dateString(date);

  if(dateStrings[0]) dateStrings[0].selected = true;

  return dateStrings;
}

function populateDeliveryTimes(isToday) {
  var d = new Date(dateToday);
  var timeStrings = [];

  timeStrings[timeStrings.length] = {text: "Time?", disabled: true};

  if((d.getHours() < 21) || (d.getHours() < 22 && d.getMinutes() < 20) || !isToday) {
    timeStrings[timeStrings.length] = {text: "9PM - 10PM", value: "9-10"};
  }
  if((d.getHours() < 22) || (d.getHours() < 23 && d.getMinutes() < 20) || !isToday) {
    timeStrings[timeStrings.length] = {text: "10PM - 11PM", value: "10-11"};
  }
  if((d.getHours() < 23) || (d.getHours() < 23 && d.getMinutes() < 20) || !isToday) {
    timeStrings[timeStrings.length] = {text: "11PM - 12AM", value: "11-12"};
  }

  if(timeStrings[1]) timeStrings[1].selected = true;

  return timeStrings;
}

function deliveryTypeChanged() {
  if($("select.delivery-type").val() == "later") {
    $(".delivery-date-holder").show();
    $(".delivery-asap-info").hide();
    if($("select.delivery-date").val()) {
      $(".delivery-time-holder").show();
    }
  } else {
    $(".delivery-asap-info").show();
    $(".delivery-date-holder").hide();
    $(".delivery-time-holder").hide();
  }
  $(document.body).trigger("sticky_kit:recalc");
}

function deliveryDateChanged() {
  $("select.delivery-time").data("selectBox-selectBoxIt").remove();
  var d = new Date($("select.delivery-date").val());
  var arr = populateDeliveryTimes(d.isSameDateAs(dateToday));

  populateSelectData($("select.delivery-time").data("selectBox-selectBoxIt"), arr);

  if($("select.delivery-date").val()) {
    $(".delivery-time-holder").show();
    $(document.body).trigger("sticky_kit:recalc");
  }
}

function deliveryPaymentChanged() {
  if($("select.delivery-payment").val() == "credit-card") {
    $(".delivery-payment-form").show();
  } else {
    $(".delivery-payment-form").hide();
  }
  $(document.body).trigger("sticky_kit:recalc");
}

function placeOrder(ev) {
  ev.preventDefault();
  var form = $(ev.target);

  form.find('input, textarea, button, select').prop('disabled', true);

  form.find('button.confirm-order-btn').addClass('hide');
  form.find('.fa-refresh-div').removeClass('hide');

  var cData = {
    first_name: form.find('[name=customer-first-name]').val(),
    last_name: form.find('[name=customer-last-name]').val(),
    phone: form.find('[name=customer-phone]').val(),

    address: form.find('[name=delivery-address]').val(),
    suite: form.find('[name=delivery-suite]').val(),
    zip: form.find('[name=delivery-zip]').val(),
    notes: form.find('[name=delivery-notes-js]').val(),

    payment_type: form.find('select[name=payment-type]').val() || "",

    delivery_type: form.find('select[name=delivery-type]').val() || "",
    delivery_date: form.find('select[name=delivery-date]').val() || "",
    delivery_time: form.find('select[name=delivery-time]').val() || ""
  };

  var error = !isFormValid(form, cData);

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
      "&first_name="+cData.first_name+
      "&last_name="+cData.last_name+
      "&phone="+cData.phone+

      "&address="+cData.address+
      "&suite="+cData.suite+
      "&zip="+cData.zip+
      "&notes="+cData.notes+

      "&delivery_type="+cData.delivery_type+
      "&delivery_date="+cData.delivery_date+
      "&delivery_time="+cData.delivery_time+

      "&payment_type="+cData.payment_type+
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

    btClient.tokenizeCard({
      number: number,
      cardholderName: cardholder_name,
      expirationDate: expiration_date,
      cvv: cvv
    }, continueOrder);
  } else if(!error) {
    continueOrder(null, null);
  }
}

function setupGateway() {
  $.ajax({
    type: "GET",
    url: '/order/clientToken',
    cache: false,
    success: function(token){
      btClient = new braintree.api.Client({clientToken: token});
    }
  });
}

module.exports = {
  init: function() {
    $("select.delivery-type").selectBoxIt();
    $("select.delivery-date").selectBoxIt({
      populate: populateDeliveryDates
    });
    $("select.delivery-time").selectBoxIt();

    $("select.delivery-payment").selectBoxIt();

    $("select.delivery-type").bind("change", deliveryTypeChanged);
    $("select.delivery-date").bind("change", deliveryDateChanged);
    $("select.delivery-payment").bind("change", deliveryPaymentChanged);

    $(".product-remove").bind("click", productRemove);

    $("form.delivery-form").bind("submit", placeOrder);

    $(window).bind("resize", sticky);

    setupGateway();
    deliveryTypeChanged();
    deliveryDateChanged();
    sticky();
  },
};
