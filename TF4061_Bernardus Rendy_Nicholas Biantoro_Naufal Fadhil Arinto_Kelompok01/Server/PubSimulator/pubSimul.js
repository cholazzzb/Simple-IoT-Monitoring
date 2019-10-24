var mqtt = require("mqtt");

// Create client Object
var client = mqtt.connect([{ host: "localhost", port: 3000 }]);
var data = 4;
var valAlarm = "1";
var countAlarm = 1;

// Connect to Mosca server
client.on("connect", function() {
  // client.publish('topic1', '2')

  // loop every 1000 ms
  setInterval(function() {
    // Publish temp in topic : temp
    client.publish("analogTemperature", data.toString());
    data++;
    if (data == 10) {
      data = 4;
    }

    // // TODO Publish rtc (BELUM BERES)
    var time = new Date();
    var sec = time.getSeconds();
    var mils = time.getMilliseconds();
    var timestamp = sec.toString() + "." + mils.toString();
    client.publish("timetemp", timestamp);

    // Publish alarm
    client.publish("alarm", valAlarm);
    countAlarm++;
    if (countAlarm == 3) {
      countAlarm = 1;
      if (valAlarm == "1") {
        valAlarm = "0";
      } else {
        valAlarm = "1";
      }
    }

    // Publish analogHumidity
    client.publish("analogHumidity", "87.5");

    // Publish LDR
    client.publish("analogLDR", "87.5");

    // Publish rtc
    client.publish("rtc", "87.5");

    // Console.log is used to print "" in terminal
    console.log("Published!");
  }, 1000);
});
