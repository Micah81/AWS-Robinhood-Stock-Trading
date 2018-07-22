// open file
var fs = require('fs');

function checkHoliday(a,b,callback){
  fs.readFile('/home/ec2-user/stack/isHoliday.csv', 'utf8', function(err, data) {
      if (err) throw err;
      console.log(data);
      if (data != "true"){
        console.log("Continuing, today is not a holiday.");
      }else{
        console.log("Quitting, today is a holiday.");
        process.exit();
      }
  })};

// --------------------------------------------------------------------------------------------
// Run in a fiber -----------------------------------------------------------------------------
var Sync = require('sync');
Sync(function(){
     try {
          var resCheckHoliday = checkHoliday.sync(null,null,null);
     }
     catch (e) {
      console.error(e);
     }
})
