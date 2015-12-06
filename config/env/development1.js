var braintree = require('braintree');

module.exports = {
  db: 'mongodb://localhost/rollerbakers',
  gateway: braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: 'rtms7hmpfnm29xjf',
    publicKey: '73sg4fzbqjv7p79g',
    privateKey: 'ba26dc53af71f90d31cc43d10dcaf48d'
  })
};
