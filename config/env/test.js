var braintree = require('braintree');

module.exports = {
  db: 'mongodb://localhost/rollerbakers_test',
  gateway: braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MID,
    publicKey: process.env.BRAINTREE_PUB,
    privateKey: process.env.BRAINTREE_PRI
  })
};
