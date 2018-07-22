// --------------------
// Preferences
var UseRH = 1;
var sendAlert = 1;
var updateStockTwitsWL = 1;
var updateGoogleFinWL = 1;
// --------------------
// Global variables
var buying_power;//=38.59;
var credentials = {
    username: 'UserName',
    password: 'Password'
};
var qty_shares;
var symbol;
var num_new_stocks;
var price;
var ask_price;
var rhUrl;
var quoteUrl;
var trade_id;
var acct_multiplier;
var query;
// --------------------
if (UseRH==1){
  // Get buying power from Robinhood
  var Robinhood = require('robinhood')(credentials, function(){
    Robinhood.accounts(function(err, response, body){
      if(err){
        console.error(err)
      }
      else{
        unc_dep = body.results[0]['uncleared_deposits']
        unc_dep = parseFloat(unc_dep)
        uns_fun = body.results[0]['unsettled_funds']
        uns_fun = parseFloat(uns_fun)
        cash = body.results[0]['cash']
        cash = parseFloat(cash)
        buying_power = uns_fun + unc_dep + cash
        buying_power = buying_power.toFixed(2)
        //console.log(buying_power)
      }
    })
  })
}

//--- Select stock to buy
var mongoose = require('mongoose');
var url = 'mongodb://...'
//mongoose.connect(url, { useMongoClient: true })
mongoose.connect(url);
var db = mongoose.connection;
var stockSchema = mongoose.Schema({
    Symbol: String,
    eps_qq: String,
    price: Number
},{collection:'data'});
var tradeSchema = mongoose.Schema({
    trade_id: String,
    updated: Date
},{collection:'trades'});
var statusSchema = mongoose.Schema({
    restart: Number
},{collection:'status'});
var data = mongoose.model('data', stockSchema);
var trades = mongoose.model('trades', tradeSchema);
var status = mongoose.model('status', statusSchema);

db.on('error', console.error.bind(console, 'connection error:'));

mongoose.Promise = require('bluebird');

var moment = require('moment');
let lastHour = moment().subtract(6, 'hour')

var today = new Date();
var yesterday = new Date(today.getTime() - (1000*60*60*24));
//var hourago = new Date(today.getTime() - (1000*60*60));
//console.log(today);
//console.log(yesterday);
//console.log(hourago);


query = {
    "Date": {
    "$gte" : yesterday
 },
    "eps_qq" : {'$gt':'0%'}
};

db.once('open', function() {

  data.find(query).exec(function (err, results) {
    num_new_stocks = results.length
    console.log(num_new_stocks) // << ----------------------------------------------- 2
  });

  status.find(({}),{'restart':'1'}, function (err, docs) {
    //console.log(docs)
    var startup_status = docs[0]['restart'];
    console.log("startup_status: "); // <<----------------------------------------- 3
    console.log(startup_status); // <<--------------------------------------------- 4
    if(startup_status==1){
      status.updateOne({'restart':1}, {'restart':0}, function(err, res) {
        if (err) {
          throw err;
        } else {
          console.log("Status now set to 0.");}
        }
      );
      acct_multiplier = 0.5;
      console.log("A")
      console.log(acct_multiplier)
    }else{
      acct_multiplier = 1;
      console.log("B") // <<------------------------------------------------------- 5
      console.log(acct_multiplier) // <<------------------------------------------- 6
    }
  });
  console.log("db1") // << --------------------------------------------------------------- 1
  data.find(query, function (err, stocks) {
    console.log("2") // << --------------------------------------------------------------  7
    if (err) return console.error(err);
    if(num_new_stocks==0){
      console.log("There are no new upgrades.") // << ------------------------------------ 8
      process.exit(1);
    }
    for(var i = 0; i < num_new_stocks; i++) {
      console.log("3")
      symbol = stocks[i]['Symbol'];
      var eps_qq = stocks[i]['eps_qq'];
      price = stocks[i]['price'];
      var price_plus_5pct = price + (price * 0.05);
      if (buying_power > price_plus_5pct){
        console.log("4")
        qty_shares = (buying_power * acct_multiplier) / price_plus_5pct;
        qty_shares = Math.floor(qty_shares)
        console.log("ttl: ");
        var ttl = buying_power * acct_multiplier;
        console.log(ttl);
        // open trade
        var Robinhood2 = require('robinhood')(credentials, function(){
          Robinhood2.instruments(symbol,function(err, response, body){
            if(err){
              console.error(err);
            }else{
              rhUrl = body.results[0]['url'];
              quoteUrl = body.results[0]['quote'];

              var getJSON = require('get-json')
              getJSON(quoteUrl, function(error, response){
                if(err){
                  console.error(err);
                }else{
                  //console.log(response)
                  ask_price = response['ask_price']
                  console.log(ask_price);

                  var options = {
                    quantity: qty_shares,
                    instrument: { url: rhUrl,
                                  symbol: symbol },
                    bid_price: ask_price
                    // Optional:
                    // trigger: String, // Defaults to "gfd" (Good For Day)
                    // time: String,    // Defaults to "immediate"
                    // type: "limit"     // Defaults to "market"
                    }
                    Robinhood2.place_buy_order(options, function(error, response, body){
                      if(error){
                          console.error(error);
                      }else{
                          trade_id = body['id'];
                          console.log(trade_id)

                          if (trade_id==undefined){
                            console.log("Order not sent.")
                          }else{
                            console.log("Order sent!");
                          }

                          trades.find(({}),{'trade_id':'1','updated':'1'}, function (err, docs) {
                            var this_trade_id = docs[0]['trade_id'];
                            console.log(this_trade_id);
                            console.log(trade_id);
                            trades.updateOne({'trade_id':this_trade_id}, {'trade_id':trade_id, 'updated':new Date()}, function(err, res) {
                              if (err) {
                                throw err;
                                db.close();
                              } else {
                                db.close();}
                            }
                          );
                          }).sort({'updated':1}).limit(1)


                          // add it to StockTwits watchlist
                          // add it to Google Finance watchlist
                      }
                    })
                }
              })
            }
          });

          });

        break;
      }
      else{ // too expensive
        continue;
      }
    }
  }).sort([['eps_qq', -1]]);
});
