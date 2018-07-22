// Check if it is a holiday, t/f
var holidayChecker = require('usa-holidays');
var date = new Date();
var holidayObj = holidayChecker.make(date);
var isHoliday = !holidayObj.isBusinessDay();

// put the answer into a file so it can be read by python crons
var fs = require('fs');
fs.writeFile("/home/ec2-user/stack/isHoliday.csv", isHoliday, function(err) {
    if(err) {
        return console.log(err);
    }
});
