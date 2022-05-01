const mongoose = require('mongoose');
const logger = require('./utils/logger');
mongoose.Promise = Promise;
const User = require("./models/user")
// const Store = require("../models/store")

const express = require('express')
const app = express()
const dotenv = require('dotenv');
dotenv.config();
const config = require('config');

let database;
if (process.env.NODE_ENV === "testing") {
  database = 'mongodb://' + config.get('mongodb_test.address') + '/' + config.get('mongodb_test.dbname')
} else if (process.env.NODE_ENV === "development") {
  database = 'mongodb://' + config.get('mongodb.address') + '/' + config.get('mongodb.dbname')
} else {
  throw Error(`invalid NODE_ENV environment variable: ${process.env.NODE_ENV}`)
}

mongoose.connect(database, { useNewUrlParser: true, useUnifiedTopology: true });
require('./utils/initializer').init()


// Start the server
app.listen(config.get('port'));
logger.info('API initialized on port ' + config.get('port'));

// authentication middleware
app.use( async function (req, res, next) {
  // parse username and password from headers
  const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
  if (!b64auth) {
    res.status(401).send('Authentication required.')
  }
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')

  // fetch the user object from that username and check the password against its hash on the db.
  const query = User.findOne({username: login})
  const user = await query.exec()
  if (user && user.verifyPassword(password)) {
    req.user = user
    return next()
  } else {
    res.status(401).send('Invalid Authentication.')
  }

})
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api', require('./routes/stores'));

module.exports = app
