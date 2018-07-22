# -*- coding: utf-8 -*-
"""
Created on Thu Feb 22 20:46:55 2018

@author: micah
"""
import urllib as u
from bs4 import BeautifulSoup as bs
upgrades = []
#
# Get stocks with earnings releases after market close 
#     
#esurl = 'https://finance.yahoo.com/calendar/earnings/'
esurl = 'https://finance.yahoo.com/calendar/earnings?from=2018-03-04&to=2018-03-06&day=2018-03-06' 

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