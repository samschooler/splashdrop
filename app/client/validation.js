var valid = require('card-validator');

module.exports = {
  isEmailValid: function(email) {
    return true;
  },
  isCreditCardValid: function(number) {
    return valid.number(number).isValid;
  },
  isExpirationDateValid: function(date) {
    return valid.expirationDate(date).isValid;
  },
  isCVVValid: function(cvv) {
    console.log(cvv);
    if(cvv.length <= 4) {
      return true;
    }
    return false;
  }
};
