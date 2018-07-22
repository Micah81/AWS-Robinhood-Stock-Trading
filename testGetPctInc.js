var request = require('request');
var cheerio = require('cheerio');

var Stock_Chg = 0.0;
function getStock_Chg(a,b,callback){
    var Stock_url = 'https://finviz.com/quote.ashx?t=USAK'; //<----
    request(Stock_url, function (error, response, html) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        $('.snapshot-td2-cp').each(function(i, element){
          var td = $(this);
          if(td.text()==='Change'){
            Stock_Chg = td.next().text();
            Stock_Chg = parseFloat(Stock_Chg)
            console.log("Stock_Chg:")
            console.log(Stock_Chg)
          }
        });
      }
    });
  };

getStock_Chg(null,null,null);
