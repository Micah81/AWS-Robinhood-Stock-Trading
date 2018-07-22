/* EUROPE: ftse, dax, cac */
var request = require('request');
var cheerio = require('cheerio');

// FTSE 100 Percent Up/Down
var FTSE_Chg = 0.0;
function getFTSE_Chg(a,b,callback){
    var FTSE_url = 'https://www.bloomberg.com/quote/UKX:IND';
    request(FTSE_url, function (error, response, html) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        $('[itemprop=priceChangePercent]').each(function(i, elem) {
          FTSE_Chg = $(this).attr('content')
          FTSE_Chg = parseFloat(FTSE_Chg)
          console.log("FTSE_Chg:")
          callback(FTSE_Chg);
        });
      }
    });
  };

// DAX Percent Up/Down
var DAX_Chg = 0.0;
function getDAX_Chg(a,b,callback){
    var DAX_url = 'https://www.bloomberg.com/quote/DAX:IND';
    request(DAX_url, function (error, response, html) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        $('[itemprop=priceChangePercent]').each(function(i, elem) {
          DAX_Chg = $(this).attr('content')
          DAX_Chg = parseFloat(DAX_Chg)
          console.log("DAX_Chg:")
          callback(DAX_Chg);
        });
      }
    });
};

// CAC 100 Percent Up/Down
var CAC_Chg = 0.0;
function getCAC_Chg(a,b,callback){
    var CAC_url = 'https://www.bloomberg.com/quote/CAC:IND';
    request(CAC_url, function (error, response, html) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        $('[itemprop=priceChangePercent]').each(function(i, elem) {
          CAC_Chg = $(this).attr('content')
          CAC_Chg = parseFloat(CAC_Chg)
          console.log("CAC_Chg:")
          callback(CAC_Chg);
        });
      }
    });
};

// Europe Total Up/Down
var Euro_Total = 0.0;
function getEuro_Chg(a,b,callback){
    Euro_Total = FTSE_Chg + DAX_Chg + CAC_Chg;
    Euro_Total = Euro_Total.toFixed(2)
    console.log('Euro_Total:');
    callback(Euro_Total);
}

// put Euro_Total into a file so it can be read by python crons
function writeEuroFile(a,b,callback){
var fs = require('fs');
fs.writeFile("/home/ec2-user/stack/ON_Euro_Total.csv", Euro_Total, function(err) {
    if(err) {
        return console.log(err);
    }
});
callback("ON_Euro_Total.csv updated.")
};

// --------------------------------------------------------------------------------------------
// Run in a fiber -----------------------------------------------------------------------------
var Sync = require('sync');
Sync(function(){

    try {
         var resGetFTSE_Chg = getFTSE_Chg.sync(null,null,null);
    }
    catch (e) {
     console.error(e);
    }

    try {
         var resGetDAX_Chg = getDAX_Chg.sync(null,null,null);
    }
    catch (e) {
     console.error(e);
    }

    try {
         var resGetCAC_Chg = getCAC_Chg.sync(null,null,null);
    }
    catch (e) {
     console.error(e);
    }

    try {
         var resGetEuro_Chg = getEuro_Chg.sync(null,null,null);
    }
    catch (e) {
     console.error(e);
    }

    try {
         var resWriteEuroFile_Chg = writeEuroFile.sync(null,null,null);
    }
    catch (e) {
     console.error(e);
    }

}
);
