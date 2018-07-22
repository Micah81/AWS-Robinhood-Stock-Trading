# -*- coding: utf-8 -*-
"""
Created on Fri Dec 08 03:20:00 2017
@author: micah
"""
import ifHolidayQuit
import pymongo
import urllib
import datetime
import dateutil.parser
import requests
#import isodate as ISODate

#
# Database Data
#
client = pymongo.MongoClient("mongodb://MicahM:" + urllib.quote("") + "")
db=client.stocks

# Get symbol of stocks entered prior to today's date
# the date
now = datetime.datetime.now()
year = now.year
month = now.month
today = now.day

# Today
dateStr = str(year) + "-" + str(month) + "-" + str(today)
date = dateutil.parser.parse(dateStr)

# today at 10 AM NM time. I want to buy at 8:30 AM NM time one day, then sell it at 10 AM NM time the next day.
dateStr2 = str(year) + "-" + str(month) + "-" + str(today) + "-12:00:00"
date2 = dateutil.parser.parse(dateStr2)

#N_counter = 0
#Y_counter = 0
#start = datetime.datetime(2012, 2, 2, 6, 35, 6, 764)
#end = datetime.datetime(2012, 2, 2, 6, 55, 3, 381)

#for doc in db.wing_model.find({'time': {'$gte': start, '$lt': end}}):

#dateStr3 = year + "," + month + "," + today

dateStr3 = datetime.datetime(year, month, today, 0, 0, 0, 0)
#dateStr3 = datetime.datetime(2017, 12, 21, 0, 0, 0, 0)
#cursor = db.data.find({'Date':{'$lt':dateStr3}},{'_id' : '1', 'Symbol' : '1', 'price' : '1', 'finalAnswer' : '1', 'Date' : '1'})
cursor = db.data.find({'Date':{'$lt':dateStr3}, 'finalAnswer':2},{'_id' : '1', 'Symbol' : '1', 'price' : '1', 'finalAnswer' : '1', 'Date' : '1'})

cursor.collation({ 'locale' : 'en_US', 'numericOrdering' : True })
for document in cursor:
    print(document)
    print("------------------------")
    Symbol = document['Symbol']
    sDate = document['Date']
    print(Symbol)
    print(sDate)
    print("-------")
    origPrice = document['price']
    the_id = document['_id']
    f_answer_check = document['finalAnswer']

    if f_answer_check == 2:
        try:
            # Get 10:00 MST quote from Alphavantage.co
            key = "";
            url = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol="+Symbol+"&interval=60min&outputsize=full&apikey="+key
            response = requests.get(url)
            data = response.json()
            fq_dateTime = str(date2)
            fq = int(float(0.0))
            try:
                fq = (data['Time Series (60min)'][fq_dateTime]['4. close'])
                fq = float(fq)
            except Exception as e:
                print(e)

            # compare the new quote to the original 'Price' and define the answer for the answer field
            # compare 'Price' and finalQuote (fq)
            fa = float(0.0)
            fa = float(fq) - float(origPrice)
            fa = float(fa)

            pctPL = ((float(fq) - float(origPrice)) / float(origPrice)) * 100
            pctPL = round(pctPL,2)

            #print("pctPL %:")
            #print(pctPL)

            if float(pctPL) < float(2.0): # % increase
                finalAnswer= 0
                #N_counter += 1
                #print("N_counter:")
                #print(N_counter)
            else:
                finalAnswer = 1
                #Y_counter += 1
                #print("Y_counter:")
                #print(Y_counter)

            #print("Bought at: "+str(origPrice))
            #print("Sold at: "+str(fq))
            #print("P/L: "+str(fa))
            #print("finalAnswer_1Day: "+str(finalAnswer_1Day))

            # Update database
            db.data.update_one(
                    {'_id':the_id},
                    {'$set' : {'finalQuote':fq,'finalAnswer':finalAnswer,'pctPL':pctPL} },
                    upsert=True
                    )

            #3{'$set': {services.keys()[0]: services.values()[0]}},
                               # upsert=True)

#key = {'key':'value'}
#data = {'key2':'value2', 'key3':'value3'};
#db.data.update_one(key, data, upsert=True);


        except Exception as e:
            print(e)

#print("N_counter: "+str(N_counter))
#print("Y_counter: "+str(Y_counter))
