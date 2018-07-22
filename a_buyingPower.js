/* @flow */
// GET DOLLARS TO INVEST
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var moment = require('moment');
var path = require('path');
var vars = require( path.resolve( __dirname, "./a_variables.js" ) );
var schemas = require( path.resolve( __dirname, "./a_schemas.js" ) );
var dbvars = require( path.resolve( __dirname, "./a_database.js" ) );
mongoose.connect(dbvars.url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
var acct_multiplier, buying_power;

module.exports = {
  buyingPower: function () {
    var getBuyingPower = new Promise(function(resolve, reject) {
      setTimeout(function(){
        if (vars.UseRH==1){
     vars.Robinhood = require('robinhood')(vars.credentials, function(){
       vars.Robinhood.accounts(function(err, response, body){
         if(err){
           console.error(err)
         }
         else{
           //console.log(body);
           var positionsUrl = body.results[0]['positions']
           var unc_dep = body.results[0]['uncleared_deposits']
           unc_dep = parseFloat(unc_dep)
           uns_fun = body.results[0]['unsettled_funds']
           uns_fun = parseFloat(uns_fun)
           var cash = body.results[0]['cash']
           cash = parseFloat(cash)
           buying_power = uns_fun + unc_dep + cash
           buying_power = buying_power.toFixed(2)
           console.log("Buying Power:")
           console.log(buying_power)
           resolve(buying_power)
         }})})}}, 5000);});
    var getAcctMultiplier = new Promise(function(resolve, reject) {
      setTimeout(function(){
        dbvars.status.find(({}),{'restart':'1'}, function (err, docs) {
          var startup_status = docs[0]['restart'];
          if(startup_status==1){
            dbvars.status.updateOne({'restart':1}, {'restart':0}, function(err, res) {
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
          console.log("Account Multiplier:")
          console.log(acct_multiplier);
          resolve(acct_multiplier);
        });
      }, 5000);
    });
    /*var getAcctMultiplier2 = new Promise(function(resolve, reject) {
      setTimeout(function(){
            // If no trades are open
            acct_multiplier = 0.5;
          }else{
            acct_multiplier = 1;
          }
          console.log("Account Multiplier2:")
          console.log(acct_multiplier);
          resolve(acct_multiplier);
        });
      }, 5000);
    })*/
    var getAmtToInvest = new Promise(function(resolve, reject) {
      setTimeout(function(){
        var AmtToInvest = acct_multiplier * buying_power;
        console.log("Amount to Invest:");
        console.log(AmtToInvest);
        resolve(AmtToInvest);
      }, 15000);
    })
    function AmtToInvest() {
      Promise.all([getBuyingPower, getAcctMultiplier, getAcctMultiplier2]).then(getAmtToInvest);
    }

/*    function AmtToInvest() {
        //promise_chain = promise_chain.then(promise_link);
        //getBuyingPower,getAcctMultiplier
        getBuyingPower.then(getAcctMultiplier).then(getAmtToInvest)
    }*/
    AmtToInvest();
  }
};
