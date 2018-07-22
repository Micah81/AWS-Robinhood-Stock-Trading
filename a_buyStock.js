// PLAN
// import each section as a module in a file.
// run the modules in a fiber.
// use promises to get data
// keep the output in order of execution

// LIBRARIES
var path = require('path');
var fs = require('fs');
// CHECK MARKET AND HOLIDAY CONDITIONS
function QuitIf(a,b,callback){
  var quitIf = require( path.resolve( __dirname, "./a_quitIf.js" ) );
  quitIf.checkAll();
  callback();
}
// GET DOLLARS TO INVEST
function BuyingPwr(a,b,callback){
  var buyingPower = require( path.resolve( __dirname, "./a_buyingPower.js" ) );
  buyingPower.buyingPower();
  callback();
}

// --------------------------------------------------------------------------------------------
// Run in a fiber -----------------------------------------------------------------------------
var Sync = require('sync');
Sync(function(){

    // quit if today is a holiday
    try {
         var resQuitIf = QuitIf.sync(null,null,null);
    }
    catch (e) {
     console.error(e);
    }

    try {
         var resBuyingPwr = BuyingPwr.sync(null,null,null);
    }
    catch (e) {
     console.error(e);
    }

});
