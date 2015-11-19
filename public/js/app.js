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
    if(date.getHours() < 22) {
      dateStrings[0] = {text: $.datepicker.formatDate("DD M d", date), value: date.toISOString()};
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

    if(d.getHours() < 19 || !isToday) {
      console.log(JSON.stringify("hey"));
      timeStrings[timeStrings.length] = {text: "8PM - 9PM", value: "8-9"};
    }
    if(d.getHours() < 20 || !isToday) {
      timeStrings[timeStrings.length] = {text: "9PM - 10PM", value: "9-10"};
    }
    if(d.getHours() < 21 || !isToday) {
      timeStrings[timeStrings.length] = {text: "10PM - 11PM", value: "10-11"};
    }
    if(d.getHours() < 22 || !isToday) {
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
    }
  };

  this.deliveryTimeChanged = function() {

  };

  this.init = function() {
    $("select.delivery-type").selectBoxIt();
    $("select.delivery-date").selectBoxIt({
      populate: self.populateDeliveryDates
    });
    $("select.delivery-time").selectBoxIt();

    $("select.delivery-type").bind("change", this.deliveryTypeChanged);
    $("select.delivery-date").bind("change", this.deliveryDateChanged);
    $("select.delivery-time").bind("change", this.deliveryTimeChanged);

    this.deliveryTypeChanged();
  };
}


$(function() {
  var app = new App();
  app.init();
});
