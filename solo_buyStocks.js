//var stockList = ['GARS','AVAV']; // symbol
var stockList = ['GARS']; // symbol

var path = require('path');
var vars = require( path.resolve( __dirname, "./a_variables.js" ) );

var getRHdata = function(symbol) {
  return new Promise(function(resolve, reject) {
  setTimeout(function(){
    vars.Robinhood = require('robinhood')(vars.credentials, function(){
      vars.Robinhood.instruments(vars.symbol,function(err, response, body){
        if(err){
         console.error(err);
        }else{
         console.log("rhUrl:");
         vars.rhUrl = body.results[0]['url'];
         console.log(vars.rhUrl);
         console.log("quoteUrl:");
         vars.quoteUrl = body.results[0]['quote'];
         console.log(vars.quoteUrl);
         var rhObject = {'rhUrl':vars.rhUrl,'quoteUrl':vars.quoteUrl}
         console.log(rhObject);
         vars.tradeObject.instrument.url = vars.rhUrl;
         console.log(vars.tradeObject);
         resolve(rhObject)
       }})})}), 5000 })}

var getAskPrice = function(vars_quoteUrl) {
  return new Promise(function(resolve, reject) {
  setTimeout(function(){
    var getJSON = require('get-json')
    getJSON(vars_quoteUrl, function(error, response){
        vars.ask_price = response['ask_price'];
        vars.tradeObject.bid_price = vars.ask_price;
        resolve(vars.ask_price);
   })
 }, 5000)
})}

var openTrade = function(vars_tradeObject) {
  return new Promise(function(resolve, reject){
  setTimeout(function(){
    console.log("===========")
    console.log(vars.tradeObject)
    console.log("===========")
    vars.tradeObject = vars_tradeObject;
    vars.Robinhood.place_buy_order(vars.tradeObject, function(error, response, body){
      if(error){
          console.error(error);
      }else{
          vars.trade_id = body['id'];
          if (vars.trade_id==undefined){
           console.log("Order not sent.")
           process.exit(1);
          }else{
           console.log("Order sent!");
          }
          resolve(vars.trade_id)
     }})
  }, 5000)
})}

var writeF = function(symbol) {
  return new Promise(function(resolve, reject){
    console.log(symbol)
})}


stockList.forEach(function(symbol){
  writeF(symbol).then(getRHdata(symbol)).then(getAskPrice(vars.quoteUrl)).then(openTrade(vars.tradeObject))
});
