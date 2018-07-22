/* @flow */
// Quit if today is a holiday.
// open file
var fs = require('fs');
// /home/ec2-user/stack/buyStockSync.js
function checkHoliday(a, b, callback) {
    fs.readFile('/home/ec2-user/stack/isHoliday.csv', 'utf8', function (err, data) {
        if (err) throw err;
        console.log(data);
        if (data != "true") {
            callback("Continuing, today is not a holiday.");
        } else {
            callback("Quitting, today is a holiday.");
            process.exit(1);
        }
    })
};

// --------------------
// Preferences
var UseRH = 1;
//var sendAlert = 1;
//var updateStockTwitsWL = 1;
//var updateGoogleFinWL = 1;
// --------------------
// Global variables
var buying_power; //=38.59;
var credentials = {
    username: '',
    password: ''
};
var resNumStocks;
var the_result;
var this_trade_id;
var resSymbol, resQty;
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
var eps_qq;
var Robinhood;
var tradeObject = {
    quantity: 1,
    instrument: {
        url: 'http://google.com',
        symbol: 'AMZN'
    },
    bid_price: 0.00
}
// --------------------
function getBuyingPower(a, b, callback) {
    if (UseRH == 1) {
        Robinhood = require('robinhood')(credentials, function () {
            Robinhood.accounts(function (err, response, body) {
                if (err) {
                    console.error(err)
                } else {
                    var unc_dep = body.results[0]['uncleared_deposits']
                    unc_dep = parseFloat(unc_dep)
                    uns_fun = body.results[0]['unsettled_funds']
                    uns_fun = parseFloat(uns_fun)
                    var cash = body.results[0]['cash']
                    cash = parseFloat(cash)
                    buying_power = uns_fun + unc_dep + cash
                    buying_power = buying_power.toFixed(2)
                    callback(buying_power)
                }
            })
        })
    }
}
var mongoose = require('mongoose');
var url = 'mongodb://...'
//mongoose.connect(url, { useMongoClient: true })
mongoose.connect(url);
var db = mongoose.connection;
var stockSchema = mongoose.Schema({
    Symbol: String,
    eps_qq: String,
    price: Number
}, {
    collection: 'data'
});
var statusSchema = mongoose.Schema({
    restart: Number
}, {
    collection: 'status'
});
var tradeSchema = mongoose.Schema({
    trade_id: String,
    updated: Date
}, {
    collection: 'trades'
});
var trades = mongoose.model('trades', tradeSchema);
var data = mongoose.model('data', stockSchema);
var status = mongoose.model('status', statusSchema);
db.on('error', console.error.bind(console, 'connection error:'));
mongoose.Promise = require('bluebird');
var moment = require('moment');
let lastHour = moment().subtract(6, 'hour')
var today = new Date();
var yesterday = new Date(today.getTime() - (1000 * 60 * 60 * 24));

function getAcctMultiplier(a, b, callback) {
    process.nextTick(function () {
        status.find(({}), {
            'restart': '1'
        }, function (err, docs) {
            var startup_status = docs[0]['restart'];
            if (startup_status == 1) {
                status.updateOne({
                    'restart': 1
                }, {
                    'restart': 0
                }, function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        console.log("Status now set to 0.");
                    }
                });
                acct_multiplier = 0.5;
            } else {
                acct_multiplier = 1;
            }
            callback(acct_multiplier);
        });
    })
}

function getTradeData(a, b, callback) {
    process.nextTick(function () {
        data.find({
            "Date": {
                '$gt': yesterday
            },
            //"eps_qq":{'$gt':0}
        }, function (err, stocks) {
            if (err) return console.error(err);
            num_new_stocks = stocks.length;
            if (num_new_stocks == 0) {
                console.log("There are no new upgrades.")
                process.exit(1);
            }
            for (var i = 0; i < num_new_stocks; i++) {
                symbol = stocks[i]['Symbol'];
                console.log(symbol)
                eps_qq = stocks[i]['eps_qq'];
                console.log(eps_qq)
                price = stocks[i]['price'];
                console.log(price)
                var price_plus_5pct = price + (price * 0.05);
                if (buying_power > price_plus_5pct) {
                    qty_shares = (buying_power * acct_multiplier) / price_plus_5pct;
                    qty_shares = Math.floor(qty_shares);
                    tradeObject.instrument.symbol = symbol;
                    tradeObject.quantity = qty_shares;
                    callback(tradeObject);
                    break;
                } else {
                    continue;
                }
            }
        }).sort([['eps_qq', -1]])
    })
}

var getRHdata = new Promise(function (resolve, reject) {
    setTimeout(function () {
            var Robinhood = require('robinhood')(credentials, function () {
                Robinhood.instruments(symbol, function (err, response, body) {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log("rhUrl:");
                        rhUrl = body.results[0]['url'];
                        console.log(rhUrl);
                        console.log("quoteUrl:");
                        quoteUrl = body.results[0]['quote'];
                        console.log(quoteUrl);
                        var rhObject = {
                            'rhUrl': rhUrl,
                            'quoteUrl': quoteUrl
                        }
                        console.log(rhObject);
                        tradeObject.instrument.url = rhUrl;
                        console.log(tradeObject);
                        callback(rhObject)
                    }
                })
            })
        }

        function getAskPrice(a, b, callback) {
            var getJSON = require('get-json')
            getJSON(quoteUrl, function (error, response) {
                ask_price = response['ask_price'];
                tradeObject.bid_price = ask_price;
                callback(ask_price);
            })
        })
});

function openTrade(a, b, callback) {
    Robinhood.place_buy_order(tradeObject, function (error, response, body) {
        if (error) {
            console.error(error);
        } else {
            trade_id = body['id'];
            if (trade_id == undefined) {
                console.log("Order not sent.")
                process.exit(1);
            } else {
                console.log("Order sent!");
            }
            callback(trade_id)
        }
    })
}

function updateMongo(a, b, callback) {
    trades.find(({}), function (err, docs) {
        trades.updateOne({
            '_id': docs[0]['_id']
        }, {
            $set: {
                'trade_id': trade_id,
                'updated': new Date(),
                'quote_url': rhUrl
            }
        }, function (err, res) {
            if (err) {
                the_result = "Error, Mongo not updated.";
                throw err;
            } else {
                the_result = "Mongo updated.";
            }
            callback(the_result);
        });
    }).sort([['updated', 1]]).limit(1);
}
// --------------------------------------------------------------------------------------------
// Run in a fiber -----------------------------------------------------------------------------
var Sync = require('sync');
Sync(function () {

    // quit if today is a holiday
    try {
        var resCheckHoliday = checkHoliday.sync(null, null, null);
    } catch (e) {
        console.error(e);
    }

    // getBuyingPower
    try {
        var resBuyingPower = getBuyingPower.sync(null, null, null);
        //console.log('resBuyingPower:');
        //console.log(resBuyingPower);
    } catch (e) {
        console.error(e);
    }

    // resAcctMult
    try {
        var resAcctMult = getAcctMultiplier.sync(null, null, null);
        //console.log('resAcctMult:');
        //console.log(resAcctMult);
    } catch (e) {
        console.error(e);
    }

    // resTradeData
    try {
        var resTradeData = getTradeData.sync(null, null, null);
        //console.log('resTradeData:');
        //console.log(resTradeData);
    } catch (e) {
        console.error(e);
    }

    // get RH object (rhUrl, quoteUrl)
    try {
        var resRHdata = getRHdata.sync(null, null, null);
        console.log('resRHdata:');
        //console.log(resRHdata);
    } catch (e) {
        console.error(e);
    }

    // get fresh ask price
    try {
        var resAskPrice = getAskPrice.sync(null, null, null);
        console.log('resAskPrice:');
        //console.log(resAskPrice);
    } catch (e) {
        console.error(e);
    }

    // place order to buy
    try {
        var resOpenTrade = openTrade.sync(null, null, null);
        console.log('resOpenTrade:');
        console.log(resOpenTrade);
    } catch (e) {
        console.error(e);
    }

    // update trades db
    try {
        var resUpdateMongo = updateMongo.sync(null, null, null);
        console.log('resUpdateMongo:');
        console.log(resUpdateMongo);
    } catch (e) {
        console.error(e);
    }

    db.close();
})
