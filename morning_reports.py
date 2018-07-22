import pymongo
import urllib
import ifHolidayQuit
#---------Customizations
sendEmails = 1
#----------------------
client = pymongo.MongoClient("mongodb://MicahM:" + urllib.quote("") + "")
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

## Daily email report
cursor = db.data.find({'Date' : todays_date, 'eps_qq':{'$gt':100}},{'Symbol':'1','eps_qq':'1','price':'1'}).sort([("eps_qq", -1),("price", -1)])
content_object = []
cursor.collation({ 'locale' : 'en_US', 'numericOrdering' : True })
for document in cursor:
    print(document['Symbol']+" "+document['price']+" "+str(document['eps_qq']))

    content_object.append(document['Symbol']+" "+document['price']+" "+str(document['eps_qq']))

#------------------------ Daily Email
if sendEmails == 1:
    import smtplib
    msg = "\r\n".join([
      "From: email@gmail.com",
      str(content_object),
      ""
      ])
    username = 'email@gmail.com'
    password = 'Password'
    server = smtplib.SMTP('smtp.gmail.com:587')
    server.ehlo()
    server.starttls()
    server.login(username,password)
    server.sendmail('email@email.com', ['5054567017@sms.myboostmobile.com','5056545432@txt.att.net'], msg)
    server.quit()
#---------------------

cursor = db.data.find({'eps_qq':{'$gt':'0'}}, {'Date':'1', 'Symbol' : '1', 'eps_qq' : '1', 'price' : '1'}).sort([("eps_qq", -1), ("price", 1)]).limit(1)




    
