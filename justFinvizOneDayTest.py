import StringIO      
import feedparser
import re
import urllib as u
from bs4 import BeautifulSoup as bs
import pymongo
import urllib
from requests import get
import csv
import requests
import json
import datetime
import dateutil.parser
#import ifHolidayQuit
upgrades = []
#
# Get stocks with earnings releases after market close
#
#esurl = 'https://finance.yahoo.com/calendar/earnings/'
esurl = 'https://finance.yahoo.com/calendar/earnings?from=2018-03-04&to=2018-03-08&day=2018-03-08'
try:
    html = u.urlopen(esurl).read()
    soup = bs(html, 'lxml')
    for link in soup.find_all('a'):
        if len(link.text) < 5 and (link.text).isupper():
            symbol = link.text
            sched_time = soup.find(text=link.text).findNext('td').findNext('span').contents[0]
            if sched_time == "After Market Close":
                print(symbol)
                print(sched_time)
                symbol = symbol.encode("ascii")
                upgrades.append(symbol)
    print('Earnings Scheduled After Market Close:')
    print(upgrades)
except Exception as e:
    print(e)
#
# Get upgrades from briefing.com #######################################
#
url = 'http://rss.briefing.com/Investor/RSS/UpgradesDowngrades.xml'
d = feedparser.parse(url)

count =0
for post in d.entries:
    title = post.title
    if 'Outperform' in title or 'Buy' in title and 'cuts' not in title and 'reits' not in title:
    #if 'ups' in title:
        if count == 0 or count % 2 == 0:
            Title = title.split(':')[count].encode("ascii")
            upgrades.append(Title)
count += 1

#
# Make sure they are unique, no duplicates
#
upgrades = str(upgrades)
upgrades = re.sub('[\'\[\],]', '', upgrades)
print(upgrades)

upgrades_e = []
for word in upgrades.split():
    word = '$'+format(word)
    upgrades_e.append(word)

print(upgrades_e)
#
# Clean up the list of stocks
#
upgrades_e = str(upgrades_e)
upgrades_e = re.sub('[\'\[\] ]', '', upgrades_e)
upgrades_e = upgrades_e.split()
upgrades_e = [x for x in upgrades_e if "." not in x]
upgrades_e = set(upgrades_e) # removes duplicates
upgrades_e = list(upgrades_e) # but still needs to be a list

print(upgrades_e)

upgrades_f = str(upgrades)
for word in upgrades_f.split():
    sym = word
    if (len(sym) < 5):
        print(sym)
        Symbol = sym

        # the date
        now = datetime.datetime.now()
        year = now.year
        month = now.month
        day = now.day
        theDate = str(year) + "-" + str(month) + "-" + str(day)
        dateStr = theDate
        date = dateutil.parser.parse(dateStr)

        # FINVIZ
        Symbol = re.sub('[$%]', '', Symbol)
        print('Symbol: ')
        print(Symbol)
        url = r'http://finviz.com/quote.ashx?t={}'\
                                .format(Symbol.lower())
        try:
            html = u.urlopen(url).read()
            soup = bs(html, 'lxml')

            mc_ =  soup.find(text = r'Market Cap')
            mc = mc_.find_next(class_='snapshot-td2').text

            inc =  soup.find(text = r'Income')
            _income = inc.find_next(class_='snapshot-td2').text

            sales_ =  soup.find(text = r'Sales')
            _sales = sales_.find_next(class_='snapshot-td2').text

            bvps_ =  soup.find(text = r'Book/sh')
            bvps = bvps_.find_next(class_='snapshot-td2').text

            cs =  soup.find(text = r'Cash/sh')
            cvps = cs.find_next(class_='snapshot-td2').text

            div_ =  soup.find(text = r'Dividend')
            div = div_.find_next(class_='snapshot-td2').text

            emp_ =  soup.find(text = r'Employees')
            emp = emp_.find_next(class_='snapshot-td2').text

            opt =  soup.find(text = r'Optionable')
            _optionable = opt.find_next(class_='snapshot-td2').text

            sh =  soup.find(text = r'Shortable')
            _shortable = sh.find_next(class_='snapshot-td2').text

            # 1 is buy, 5 is sell
            rec =  soup.find(text = r'Recom')
            recom = rec.find_next(class_='snapshot-td2').text

            pe_ =  soup.find(text = r'P/E')
            _pe = pe_.find_next(class_='snapshot-td2').text

            fpe_ =  soup.find(text = r'Forward P/E')
            forw_pe = fpe_.find_next(class_='snapshot-td2').text

            peg_ =  soup.find(text = r'PEG')
            _peg = peg_.find_next(class_='snapshot-td2').text

            ps_ =  soup.find(text = r'P/S')
            _ps = ps_.find_next(class_='snapshot-td2').text

            pb_ =  soup.find(text = r'P/B')
            _pb = pb_.find_next(class_='snapshot-td2').text
            #print(_pb)

            pc_ =  soup.find(text = r'P/C')
            _pc = pc_.find_next(class_='snapshot-td2').text

            pfcf_ =  soup.find(text = r'P/FCF')
            _pfcf = pfcf_.find_next(class_='snapshot-td2').text

            qr_ =  soup.find(text = r'Quick Ratio')
            _qr = qr_.find_next(class_='snapshot-td2').text

            cr_ =  soup.find(text = r'Current Ratio')
            _cr = cr_.find_next(class_='snapshot-td2').text

            de_ =  soup.find(text = r'Debt/Eq')
            de = de_.find_next(class_='snapshot-td2').text

            ltde_ =  soup.find(text = r'LT Debt/Eq')
            ltde = ltde_.find_next(class_='snapshot-td2').text

            sma20_ =  soup.find(text = r'SMA20')
            _sma20 = sma20_.find_next(class_='snapshot-td2').text

            eps_ =  soup.find(text = r'EPS (ttm)')
            _eps = eps_.find_next(class_='snapshot-td2').text

            epsny_ =  soup.find(text = r'EPS next Y')
            epsny = epsny_.find_next(class_='snapshot-td2').text

            epsnq_ =  soup.find(text = r'EPS next Q')
            epsnq = epsnq_.find_next(class_='snapshot-td2').text

            epsty_ =  soup.find(text = r'EPS this Y')
            epsty = epsty_.find_next(class_='snapshot-td2').text

            epsgny_ =  soup.find(text = r'EPS next Y')
            epsgny = epsgny_.find_next(class_='snapshot-td2').text

            epsn5y_ =  soup.find(text = r'EPS next 5Y')
            epsn5y = epsn5y_.find_next(class_='snapshot-td2').text

            epsp5y_ =  soup.find(text = r'EPS past 5Y')
            epsp5y = epsp5y_.find_next(class_='snapshot-td2').text

            sp5y_ =  soup.find(text = r'Sales past 5Y')
            sp5y = sp5y_.find_next(class_='snapshot-td2').text

            sqq_ =  soup.find(text = r'Sales Q/Q')
            sqq = sqq_.find_next(class_='snapshot-td2').text

            epsqq_ =  soup.find(text = r'EPS Q/Q')
            epsqq = epsqq_.find_next(class_='snapshot-td2').text
            epsqq = epsqq.replace("%", "")
            epsqq = float(epsqq)

            earnings_ =  soup.find(text = r'Earnings')
            _earnings = earnings_.find_next(class_='snapshot-td2').text

            sma50_ =  soup.find(text = r'SMA50')
            _sma50 = sma50_.find_next(class_='snapshot-td2').text

            insiderown_ =  soup.find(text = r'Insider Own')
            _insiderown = insiderown_.find_next(class_='snapshot-td2').text

            insidertrans_ =  soup.find(text = r'Insider Trans')
            _insidertrans = insidertrans_.find_next(class_='snapshot-td2').text

            instown_ =  soup.find(text = r'Inst Own')
            instown = instown_.find_next(class_='snapshot-td2').text

            instrans_ =  soup.find(text = r'Inst Trans')
            instrans = instrans_.find_next(class_='snapshot-td2').text

            roa_ =  soup.find(text = r'ROA')
            _roa = roa_.find_next(class_='snapshot-td2').text

            roe_ =  soup.find(text = r'ROE')
            _roe = roe_.find_next(class_='snapshot-td2').text

            roi_ =  soup.find(text = r'ROI')
            _roi = roi_.find_next(class_='snapshot-td2').text

            gm_ =  soup.find(text = r'Gross Margin')
            gm = gm_.find_next(class_='snapshot-td2').text

            om_ =  soup.find(text = r'Oper. Margin')
            om = om_.find_next(class_='snapshot-td2').text

            pm_ =  soup.find(text = r'Profit Margin')
            pm = pm_.find_next(class_='snapshot-td2').text

            payout_ =  soup.find(text = r'Payout')
            _payout = payout_.find_next(class_='snapshot-td2').text

            sma200_ =  soup.find(text = r'SMA200')
            _sma200 = sma200_.find_next(class_='snapshot-td2').text

            so_ =  soup.find(text = r'Shs Outstand')
            so = so_.find_next(class_='snapshot-td2').text

            sf_ =  soup.find(text = r'Shs Float')
            sf = sf_.find_next(class_='snapshot-td2').text

            short_flt_ =  soup.find(text = r'Short Float')
            short_flt = short_flt_.find_next(class_='snapshot-td2').text

            sr_ =  soup.find(text = r'Short Ratio')
            sr = sr_.find_next(class_='snapshot-td2').text

            tp_ =  soup.find(text = r'Target Price')
            tp = tp_.find_next(class_='snapshot-td2').text

            r52w_ =  soup.find(text = r'52W Range')
            r52w = r52w_.find_next(class_='snapshot-td2').text

            h52w_ =  soup.find(text = r'52W High')
            h52w = h52w_.find_next(class_='snapshot-td2').text

            l52w_ =  soup.find(text = r'52W Low')
            l52w = l52w_.find_next(class_='snapshot-td2').text

            rsi14_ =  soup.find(text = r'RSI (14)')
            rsi14 = rsi14_.find_next(class_='snapshot-td2').text

            relv_ =  soup.find(text = r'Rel Volume')
            relv = relv_.find_next(class_='snapshot-td2').text

            avgv_ =  soup.find(text = r'Avg Volume')
            avgv = avgv_.find_next(class_='snapshot-td2').text

            v_ =  soup.find(text = r'Volume')
            v = v_.find_next(class_='snapshot-td2').text

            pw_ =  soup.find(text = r'Perf Week')
            pw = pw_.find_next(class_='snapshot-td2').text

            pm_ =  soup.find(text = r'Perf Month')
            pm = pm_.find_next(class_='snapshot-td2').text

            pq_ =  soup.find(text = r'Perf Quarter')
            pq = pq_.find_next(class_='snapshot-td2').text

            phy_ =  soup.find(text = r'Perf Half Y')
            phy = phy_.find_next(class_='snapshot-td2').text

            py_ =  soup.find(text = r'Perf Year')
            py = py_.find_next(class_='snapshot-td2').text

            pytd_ =  soup.find(text = r'Perf YTD')
            pytd = pytd_.find_next(class_='snapshot-td2').text

            beta_ =  soup.find(text = r'Beta')
            _beta = beta_.find_next(class_='snapshot-td2').text

            atr_ =  soup.find(text = r'ATR')
            _atr = atr_.find_next(class_='snapshot-td2').text

            volatility_ =  soup.find(text = r'Volatility')
            _volatility = volatility_.find_next(class_='snapshot-td2').text

            prevc_ =  soup.find(text = r'Prev Close')
            prevc = prevc_.find_next(class_='snapshot-td2').text

            p_ =  soup.find(text = r'Price')
            p = p_.find_next(class_='snapshot-td2').text

            chg_ =  soup.find(text = r'Change')
            chg = chg_.find_next(class_='snapshot-td2').text

            client = pymongo.MongoClient("mongodb://MicahM:" + urllib.quote("") + "")

            ### test db
            #client = pymongo.MongoClient("mongodb://...")
            ###########

            db=client.stocks
            this_stock = {
                        'Date' : date,
                        'Symbol' : Symbol,
                        'marketcap' : mc,
                        'income' : _income,
                        'sales' : _sales,
                        'bookvalpershare' : bvps,
                        'cashpershare' : cvps,
                        'dividend' : div,
                        'employees' : emp,
                        'optionable' : _optionable,
                        'shortable' : _shortable,
                        'analystrec' : recom,
                        'pe' : _pe,
                        'forwpe' : forw_pe,
                        'peg' : _peg,
                        'ps' : _ps,
                        'pb' : _pb,
                        'pc' : _pc,
                        'pfcf' : _pfcf,
                        'quickratio' : _qr,
                        'currratio' : _cr,
                        'debt_to_eqty' : de,
                        'lt_debt_to_eqty' : ltde,
                        'sma20' : _sma20,
                        'eps' : _eps,
                        'eps_nxt_yr' : epsny,
                        'eps_nxt_q' : epsnq,
                        'eps_this_yr' : epsty,
                        'eps_growth_nxt_y' : epsgny,
                        'eps_nxt_5y' : epsn5y,
                        'eps_past_5y' : epsp5y,
                        'sales_past_5y' : sp5y,
                        'sales_qq' : sqq,
                        'eps_qq' : epsqq,
                        'earnings' : _earnings,
                        'sma50' : _sma50,
                        'insiders_own' : _insiderown,
                        'insider_trans' : _insidertrans,
                        'inst_own' : instown,
                        'inst_trans' : instrans,
                        'roa' : _roa,
                        'roe' : _roe,
                        'roi' : _roi,
                        'gross_margin' : gm,
                        'oper_margin' : om,
                        'profit_margin' : pm,
                        'payout' : _payout,
                        'sma200' : _sma200,
                        'shs_outst' : so,
                        'shs_float' : sf,
                        'short_float' : short_flt,
                        'short_ratio' : sr,
                        'target_price' : tp,
                        '_52w_range' : r52w,
                        '_52w_high' : h52w,
                        '_52w_low' : l52w,
                        'rsi_14' : rsi14,
                        'rel_vol' : relv,
                        'avg_vol' : avgv,
                        'volume' : v,
                        'perf_wk' : pw,
                        'perf_m' : pm,
                        'perf_q' : pq,
                        'perf_half_yr' : phy,
                        'perf_yr' : py,
                        'perf_ytd' : pytd,
                        'beta' : _beta,
                        'atr' : _atr,
                        'volatility' : _volatility,
                        'prev_close' : prevc,
                        'price' : p,
                        'change' : chg,
                        'finalAnswer' : 2,
                        'finalQuote' : 0,
                        'pctPL' : 0.0001
                    }
            print(this_stock)
            try:
                mongo_id = db.data.insert_one(this_stock)
                mongo_id = mongo_id.inserted_id
                print(mongo_id)
            except Exception as e:
                print(e)

        except Exception as e:
            print(e)
