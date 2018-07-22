var fs = require('fs');

module.exports = {
  checkAll: function () {
    chkHoliday = new Promise((resolve, reject) => {
      setTimeout(() => {
        fs.readFile('/home/ec2-user/stack/isHoliday.csv', 'utf8', function(err, data) {
            if (err) throw err;
            chkH = data;
            resolve(data);
        })
      }, 5000)
    });
    chkAsianMarkets = new Promise ((resolve, reject) => {
      setTimeout(() => {
        fs.readFile('/home/ec2-user/stack/ON_Asia_Total.csv', 'utf8', function(err, data) {
          if (err) throw err;
          chkA = data;
          resolve(data);
        })
      }, 5000)
    });
    chkEuroMarkets = new Promise ((resolve, reject) => {
      setTimeout(() => {
        fs.readFile('/home/ec2-user/stack/ON_Euro_Total.csv', 'utf8', function(err, data) {
          if (err) throw err;
          chkE = data;
          resolve(data);
        })
      }, 5000)
    });
    var quitIf = () => {
      if(chkH=='true'){
        console.log("Quitting because it's a holiday.")
        process.exit(1);
      }
      else if (chkA < -1.5){
        console.log("Quitting because the Asian markets are down "+chkA+"%.");
        process.exit(1);
      }
      else if (chkE < -1.5){
        console.log("Quitting because the European markets are down "+chkE+"%.");
        process.exit(1);
      }
    }
    function isTradingDay() {
        Promise.all([chkHoliday, chkAsianMarkets, chkEuroMarkets]).then(quitIf);
    }
    isTradingDay();
  }
};
