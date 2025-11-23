const mongoose = require('mongoose');
const dbConfig = require('../config/db.js');

mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;

db.products = require('./productModel')(mongoose);
db.movements = require('./inventoryMovement')(mongoose);
db.users = require('./user')(mongoose);

module.exports = db;


