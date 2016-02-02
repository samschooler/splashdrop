module.exports = {
  db: process.env.OPENSHIFT_MONGODB_DB_URL,
  root: process.cwd(),
  dropbox: {
    key: process.env.DROPBOX_KEY,
    secret: process.env.DROPBOX_SECRET
  }
};
