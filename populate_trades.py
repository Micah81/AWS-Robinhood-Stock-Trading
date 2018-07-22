# -*- coding: utf-8 -*-
"""
Created on Wed Dec 27 13:24:40 2017

@author: micah
"""
import pymongo, urllib
import datetime
import dateutil.parser

# the date
now = datetime.datetime.now()
year = now.year
month = now.month
day = (now.day)-1
theDate = str(year) + "-" + str(month) + "-" + str(day)
dateStr = theDate
date = dateutil.parser.parse(dateStr)

# create the entry
entry = {
        'trade_id' : 'trade2',
        'updated' : date
        }

# put in db
client = pymongo.MongoClient("mongodb://MicahM:" + urllib.quote("") + "")
db=client.stocks
cursor = db.trades.update_one(
                    {'trade_id':'trade1'},
                    {'$set' : {'updated':date} },
                    upsert=False
                    )
