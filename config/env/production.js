var braintree = require('braintree');

module.exports = {
  db: process.env.OPENSHIFT_MONGODB_DB_URL,
  gateway: braintree.connect({
    environment: braintree.Environment.Production,
    merchantId: process.env.BRAINTREE_MID,
    publicKey: process.env.BRAINTREE_PUB,
    privateKey: process.env.BRAINTREE_PRI
  }),
  root: process.cwd()
};
