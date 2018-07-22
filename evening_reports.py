import pymongo
import urllib
import ifHolidayQuit
#---------Customizations
sendEmails = 1
#----------------------
client = pymongo.MongoClient("mongodb://...:" + urllib.quote("") + "")
db=client.stocks
import dateutil.parser, datetime
now = datetime.datetime.now()
year = now.year
month = now.month
today = now.day
todayStr = str(year) + "-" + str(month) + "-" + str(today)
todays_date = dateutil.parser.parse(todayStr)

# account for the weekend
if todays_date.weekday() == 0:
    yesterday = now.day - 3
else:
    yesterday = now.day - 1

dateStr = str(year) + "-" + str(month) + "-" + str(yesterday)
date = dateutil.parser.parse(dateStr)

## Daily email report
ttlPctPL = 0.0
numStocks = 0
ttlDlrPL = 0.00
cursor = db.data.find({'Date' : date},{'Symbol':'1','pctPL':'1','finalQuote':'1', 'price':'1'})

cursor.collation({ 'locale' : 'en_US', 'numericOrdering' : True })
for document in cursor:
    numStocks = numStocks + 1
    pctPL = document['pctPL']
    ttlPctPL = ttlPctPL + pctPL

    finalQuote = document['finalQuote']
    startingPrice = document['price']
    DlrPL = float(finalQuote) - float(startingPrice)
    ttlDlrPL = ttlDlrPL + DlrPL

avgPctPL = ttlPctPL / numStocks
avgDlrPL = ttlDlrPL / numStocks

print("Total PL% "+str("%.2f" %ttlPctPL))
print("Avg PL% "+str("%.2f" %avgPctPL))
# now do dollar amounts
print("Total $PL "+str("%.2f" %ttlDlrPL))
print("Avg $PL "+str("%.2f" %avgDlrPL))
print("# Stocks "+str(numStocks))

#------------------------ Daily Email
if sendEmails == 1:
    import smtplib
    msg = "\r\n".join([
      "From: email@gmail.com",
      "To: 6065551234@sms.myboostmobile.com",
      "Daily Report: ",
      "",
      "Total PL% "+str("%.2f" %ttlPctPL),
      "Avg PL% "+str("%.2f" %avgPctPL),
      "Total $PL "+str("%.2f" %ttlDlrPL),
      "Avg $PL "+str("%.2f" %avgDlrPL),
      "# Stocks "+str(numStocks)
      ])
    username = 'email@gmail.com'
    password = 'EmailPassword'
    server = smtplib.SMTP('smtp.gmail.com:587')
    server.ehlo()
    server.starttls()
    server.login(username,password)
    server.sendmail('email@gmail.com', ['5554567017@sms.myboostmobile.com','5055678765@txt.att.net'], msg)
    server.quit()
#---------------------

cursor = db.data.find({'eps_qq':{'$gt':'0'}}, {'Date':'1', 'Symbol' : '1', 'eps_qq' : '1', 'price' : '1'}).sort([("eps_qq", -1), ("price", 1)]).limit(1)




    
