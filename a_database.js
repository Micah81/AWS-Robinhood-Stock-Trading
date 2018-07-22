// DATABASE VARIABLES
var moment = require('moment');
var mongoose = require('mongoose');
var path = require('path');
var schemas = require( path.resolve( __dirname, "./a_schemas.js" ) );
var today = new Date();

module.exports = {
  url: 'mongodb://...',
  trades : mongoose.model('trades', schemas.tradeSchema),
  data : mongoose.model('data', schemas.stockSchema),
  status : mongoose.model('status', schemas.statusSchema),
  lastHour : moment().subtract(6, 'hour'),
  today : today,
  yesterday : new Date(today.getTime() - (1000*60*60*24))
}
