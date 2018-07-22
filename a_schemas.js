var mongoose = require('mongoose');

module.exports = {
  stockSchema: mongoose.Schema({
      Symbol: String,
      eps_qq: String,
      price: Number
  },{collection:'data'}),
  statusSchema : mongoose.Schema({
      restart: Number
  },{collection:'status'}),
  tradeSchema : mongoose.Schema({
      trade_id: String,
      updated: Date
  },{collection:'trades'}),
}
