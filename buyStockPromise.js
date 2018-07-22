// LIBRARIES
var fs = require('fs');
// GLOBAL VARIABLES
var chkH, chkA, chkE, UseRH = 1, buying_power, resNumStocks, the_result, this_trade_id, resSymbol, resQty;
var qty_shares, symbol, num_new_stocks, price, ask_price, rhUrl, quoteUrl, trade_id, acct_multiplier;
var query, eps_qq, Robinhood, phase2=0;
var tradeObject = {
     quantity: 1,
     instrument: {
          url: 'http://google.com',
          symbol: 'AMZN'},
     bid_price: 0.00
}
var credentials = {
    username: 'UserName',
    password: 'Password'
};
// DATABASE VARIABLES
var mongoose = require('mongoose');
var url = 'mongodb://...'
mongoose.connect(url);
var db = mongoose.connection;
var stockSchema = mongoose.Schema({
    Symbol: String,
    eps_qq: String,
    price: Number
},{collection:'data'});
var statusSchema = mongoose.Schema({
    restart: Number
},{collection:'status'});
var tradeSchema = mongoose.Schema({
    trade_id: String,
    updated: Date
},{collection:'trades'});
var trades = mongoose.model('trades', tradeSchema);
var data = mongoose.model('data', stockSchema);
var status = mongoose.model('status', statusSchema);
db.on('error', console.error.bind(console, 'connection error:'));
mongoose.Promise = require('bluebird');
var moment = require('moment');
let lastHour = moment().subtract(6, 'hour')
var today = new Date();
var yesterday = new Date(today.getTime() - (1000*60*60*24));
// GET DOLLARS TO INVEST, part 1
var getBuyingPower = new Promise(function(resolve, reject) {
  setTimeout(function(){
    if (UseRH==1){
 Robinhood = require('robinhood')(credentials, function(){
   Robinhood.accounts(function(err, response, body){
     if(err){
       console.error(err)
     }
     else{
       var unc_dep = body.results[0]['uncleared_deposits']
       unc_dep = parseFloat(unc_dep)
       uns_fun = body.results[0]['unsettled_funds']
       uns_fun = parseFloat(uns_fun)
       var cash = body.results[0]['cash']
       cash = parseFloat(cash)
       buying_power = uns_fun + unc_dep + cash
       buying_power = buying_power.toFixed(2)
       resolve(buying_power)
     }})})}}, 5000);});
var getAcctMultiplier = new Promise(function(resolve, reject) {
  setTimeout(function(){
    status.find(({}),{'restart':'1'}, function (err, docs) {
      var startup_status = docs[0]['restart'];
      if(startup_status==1){
        status.updateOne({'restart':1}, {'restart':0}, function(err, res) {
         if (err) {
            throw err;
         } else {
              console.log("Status now set to 0.");}
         }
        );
        acct_multiplier = 0.5;
      }else{
        acct_multiplier = 1;
      }
      resolve(acct_multiplier);
    });
  }, 5000);
})
// QUIT IF
chkHoliday = new Promise((resolve, reject) => {
  setTimeout(() => {
    fs.readFile('/home/ec2-user/stack/isHoliday.csv', 'utf8', function(err, data) {
        if (err) throw err;
        chkH = data;
        resolve(data);
    })
  }, 5000)
});
chkAsianMarkets = new Promise ((resolve, reject) => {
  setTimeout(() => {
    fs.readFile('/home/ec2-user/stack/ON_Asia_Total.csv', 'utf8', function(err, data) {
      if (err) throw err;
      chkA = data;
      resolve(data);
    })
  }, 5000)
});
chkEuroMarkets = new Promise ((resolve, reject) => {
  setTimeout(() => {
    fs.readFile('/home/ec2-user/stack/ON_Euro_Total.csv', 'utf8', function(err, data) {
      if (err) throw err;
      chkE = data;
      resolve(data);
    })
  }, 5000)
});
var quitIf = () => {
  if(chkH=='true'){
    console.log("Quitting because it's a holiday.")
    process.exit(1);
  }
  else if (chkA < -50){
    console.log("Quitting because the Asian markets are down "+chkA+"%.");
    process.exit(1);
  }
  else if (chkE < -50){
    console.log("Quitting because the Asian markets are down "+chkE+"%.");
    process.exit(1);
  }
  else {
    // GET DOLLARS TO INVEST, part 2
    function AmtToInvest() {
      Promise.all([getBuyingPower, getAcctMultiplier]).then(phase2=1);
    }
  }
}
function isTradingDay() {
    Promise.all([chkHoliday, chkAsianMarkets, chkEuroMarkets]).then(quitIf);
}
isTradingDay();

if(phase2==1){
  console.log("Ready for the next thing ...");
  process.exit(1);
}

/////
/*
var getBuyingPower = new Promise(function(resolve, reject) {
  setTimeout(function(){
  //{...}
  }, 5000);
});
*/
// GET ACCOUNT MULTIPLIER
