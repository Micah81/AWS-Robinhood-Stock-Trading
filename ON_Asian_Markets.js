/* ASIA: nikkei, hang seng, shanghi */
var request = require('request');
var cheerio = require('cheerio');

// Nikkei Percent Up/Down
var Nikkei_Chg = 0.0;
function getNikkei_Chg(a,b,callback){
    var Nikkei_url = 'https://www.bloomberg.com/quote/NKY:IND';
    request(Nikkei_url, function (error, response, html) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        $('[itemprop=priceChangePercent]').each(function(i, elem) {
          Nikkei_Chg = $(this).attr('content')
          Nikkei_Chg = parseFloat(Nikkei_Chg)
          console.log("Nikkei_Chg:")
          callback(Nikkei_Chg);
        });
      }
    });
  };

// Hang Seng Percent Up/Down
var HangSeng_Chg = 0.0;
function getHangSeng_Chg(a,b,callback){
    var HangSeng_url = 'https://www.bloomberg.com/quote/HSI:IND';
    request(HangSeng_url, function (error, response, html) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        $('[itemprop=priceChangePercent]').each(function(i, elem) {
          HangSeng_Chg = $(this).attr('content')
          HangSeng_Chg = parseFloat(HangSeng_Chg)
          console.log("HangSeng_Chg:")
          callback(HangSeng_Chg);
        });
      }
    });
};

// Shanghi Percent Up/Down
var Shanghi_Chg = 0.0;
function getShanghi_Chg(a,b,callback){
    var Shanghi_url = 'https://www.bloomberg.com/quote/SHCOMP:IND';
    request(Shanghi_url, function (error, response, html) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        $('[itemprop=priceChangePercent]').each(function(i, elem) {
          Shanghi_Chg = $(this).attr('content')
          Shanghi_Chg = parseFloat(Shanghi_Chg)
          console.log("Shanghi_Chg:")
          callback(Shanghi_Chg);
        });
      }
    });
};

// Asia Total Up/Down
var Asia_Total;
function getAsia_Chg(a,b,callback){
    Asia_Total = Nikkei_Chg + HangSeng_Chg + Shanghi_Chg;
    Asia_Total = Asia_Total.toFixed(2)
    console.log('Asia_Total:');
    callback(Asia_Total);
}

// put Asia_Total into a file so it can be read by python crons
function writeAsiaFile(a,b,callback){
var fs = require('fs');
fs.writeFile("/home/ec2-user/stack/ON_Asia_Total.csv", Asia_Total, function(err) {
    if(err) {
        return console.log(err);
    }
});
callback("ON_Asia_Total.csv updated.")
};


// --------------------------------------------------------------------------------------------
// Run in a fiber -----------------------------------------------------------------------------
var Sync = require('sync');
Sync(function(){

    try {
         var resGetNikkei_Chg = getNikkei_Chg.sync(null,null,null);
    }
    catch (e) {
     console.error(e);
    }

    try {
         var resGetHangSeng_Chg = getHangSeng_Chg.sync(null,null,null);
    }
    catch (e) {
     console.error(e);
    }

    try {
         var resGetShanghi_Chg = getShanghi_Chg.sync(null,null,null);
    }
    catch (e) {
     console.error(e);
    }

    try {
         var resGetAsia_Chg = getAsia_Chg.sync(null,null,null);
    }
    catch (e) {
     console.error(e);
    }

    try {
         var resWriteAsiaFile_Chg = writeAsiaFile.sync(null,null,null);
    }
    catch (e) {
     console.error(e);
    }

}
);
