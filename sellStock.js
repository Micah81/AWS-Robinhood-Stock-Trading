/* @flow */
// open file
var fs = require('fs');

function checkHoliday(a,b,callback){
  fs.readFile('/home/ec2-user/stack/isHoliday.csv', 'utf8', function(err, data) {
      if (err) throw err;
      console.log(data);
      if (data != "true"){
        console.log("Continuing, today is not a holiday.");
      }else{
        console.log("Quitting, today is a holiday.");
        process.exit(1);
      }
  })};

  // quit if today is a holiday
  try {
       checkHoliday(null,null,null);
  }
  catch (e) {
      console.error(e);
  }
// --------------------
// Preferences
// --------------------
// Global variables
var credentials = {
    username: 'UserName',
    password: 'Password'
};
var qty, ask_price, rhUrl, Symbol, quoteUrl;
//var Type = require('type-of-is');
// --------------------
// get id of trade to close
var mongoose = require('mongoose');
var url = 'mongodb://...'
//mongoose.connect(url, { useMongoClient: true })
mongoose.connect(url);
var db = mongoose.connection;
var tradeSchema = mongoose.Schema({
    trade_id: String,
    updated: Date,
    quote_url : String
},{collection:'trades'});
var trades = mongoose.model('trades', tradeSchema);

db.on('error', console.error.bind(console, 'connection error:'));

mongoose.Promise = require('bluebird');
db.once('open', function(){
  trades.find(({}), function (err, docs) {
    var sellOptions = { instrument: docs[0]['quote_url'] };
    console.log(sellOptions);
    var Robinhood = require('robinhood')(credentials, function(){
    Robinhood.orders(sellOptions, function(err, response, body){
        if(err){
            console.error(err);
        }else{
            qty = body.results[0]['quantity']
            rhUrl = body.results[0]['url']
            console.log("quoteUrl:")
            var quoteUrl = body.results[0]['instrument']

            var getJSON = require('get-json')

            getJSON(quoteUrl, function(error, response){
              if(err){
                console.error(err);
              }else{
                console.log(response);
                console.log("REAL QUOTE URL ...?? :")
                var realQuoteUrl = response['quote'];
                console.log(realQuoteUrl);
                Symbol = response['symbol'];
                console.log(Symbol);

                getJSON(realQuoteUrl, function(error, response){
                  if(err){
                    console.error(err);
                  }else{
                    console.log(response);
                    ask_price = response['ask_price']

                    console.log(qty)
                    console.log(ask_price)
                    console.log(quoteUrl)
                    console.log(Symbol)

                    var options = {
                        quantity: qty,
                        bid_price: ask_price,
                        instrument: {
                            url: quoteUrl,
                            symbol: Symbol
                          }
                        // // Optional:
                        // trigger: String, // Defaults to "gfd" (Good For Day)
                        // time: String,    // Defaults to "immediate"
                        // type: String     // Defaults to "market"
                        }

                    Robinhood.place_sell_order(options, function(error, response, body){
                        if(error){
                            console.error(error);
                            db.close();
                        }else{
                            console.log(body);
                            db.close();
                        }
                    })

                  }
                });
                }})
              }})})
  }).sort({'updated':1}).limit(1)
})
