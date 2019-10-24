/*** VARIABLE BUAT MQTT CONNECT ***/
var mqtt;
var reconnectTimeout = 2000;
var host = "localhost";
var port = 3000;

/*** GLOBAL VARIABLE ***/

// Untuk Web point 1-3 (Gauge temp, History, Rata")
var time = new Date();
var tempData;
var tempDataHistory = [];
var tempAverage = 0;
var tempAverageCount = 0;

// Untuk Publish ke Node
var wemos = ""; // Isi pesan yang dipublish ke wemos
// var state_automanual_anaOut = ""; // (Isi Topic 1)
var state_automanual = 0; // (1 = auto, 0 = manual)
var state_anaOut = 0; // (0-255)

// var state_DO_ambang = ""; // (Isi Topic 2)
var state_DO = 0; // (1 = nyala, 0 = mati)
var state_threshold = 0; // (0-255)

var state_DORGB = 0;

// RGB value
var R = 0;
var G = 0;
var B = 0;

var Humidity = 0;
// ProtocolSubscribe Example: "autoManual z digitalLed z digitalLedRGB z analogLedR z
// analogLedG z analogLedB z threshold"

// Untuk Subscribe
var state_indikator = ""; //
var state_analogLDR = "";
var state_analogHum = "";
var state_analogTem = "";
var state_rtc = "";

/*** UNTUK PLOTTING ***/
var data = [
  {
    x: [time],
    y: [tempData],
    mode: "lines",
    line: { color: "#80CAF6" }
  }
];
Plotly.plot("graphT", data);

/*** LOGIC INTERAKTIF DENGAN HTML & CSS ***/

/// SLIDER R
var sliderR = document.getElementById("sliderR");
var sliderValR = document.getElementById("sliderValR");
sliderValR.innerHTML = sliderR.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
sliderR.oninput = function() {
  sliderValR.innerHTML = this.value;
  R = this.value;
  console.log(this.value);
};

/// SLIDER G
var sliderG = document.getElementById("sliderG");
var sliderValG = document.getElementById("sliderValG");
sliderValR.innerHTML = sliderR.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
sliderG.oninput = function() {
  sliderValG.innerHTML = this.value;
  G = this.value;
  console.log(this.value);
};

/// SLIDER B
var sliderB = document.getElementById("sliderB");
var sliderValB = document.getElementById("sliderValB");
sliderValB.innerHTML = sliderB.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
sliderB.oninput = function() {
  sliderValB.innerHTML = this.value;
  B = this.value;
  console.log(this.value);
};

/// SLIDER THRESHOLD
var sliderThreshold = document.getElementById("sliderThreshold");
var sliderValThreshold = document.getElementById("sliderValThreshold");
sliderValThreshold.innerHTML = sliderThreshold.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
sliderThreshold.oninput = function() {
  sliderValThreshold.innerHTML = this.value;
  state_threshold = this.value;
  console.log(this.value);
};

function changeStatus1() {
  state_automanual = !state_automanual;
  switch (state_automanual) {
    case false: // tombol mati
      document.getElementById("butAutoManual").style.backgroundColor =
        "rgb(231, 76, 60)";
      break;
    case true: // tombol nyala
      document.getElementById("butAutoManual").style.backgroundColor =
        "rgb(46, 204, 113)";
      break;
    default:
      // Tidak ada data
      document.getElementById("butAutoManual").style.backgroundColor = "white";
  }
}

function changeStatus2() {
  state_DO = !state_DO;
  switch (state_DO) {
    case false: // LED mati
      document.getElementById("butLED").style.backgroundColor =
        "rgb(231, 76, 60)";
      break;
    case true: // LED nyala
      document.getElementById("butLED").style.backgroundColor =
        "rgb(46, 204, 113)";
      break;
    default:
      // Tidak ada data
      document.getElementById("butLED").style.backgroundColor = "white";
  }
}

function changeStatus3() {
  state_DORGB = !state_DORGB;
  switch (state_DORGB) {
    case false: // LED mati
      document.getElementById("butLEDRGB").style.backgroundColor =
        "rgb(231, 76, 60)";
      break;
    case true: // LED nyala
      document.getElementById("butLEDRGB").style.backgroundColor =
        "rgb(46, 204, 113)";
      break;
    default:
      // Tidak ada data
      document.getElementById("butLEDRGB").style.backgroundColor = "white";
  }
}

/*** AUTOMATIC MQTT FUNCTIONS ***/

// Logic bwt ngolah data di web
function onMessageArrived(msg) {
  console.log(msg.destinationName);
  console.log(msg.payloadString)

  switch (msg.destinationName) {
    case "temp": //   // Kalau pesan yang diterima topicnya "temp"
      // msg.payloadString itu isi dari topiknya
      console.log("value", msg.payloadString, "topic", msg.destinationName);
      tempData = Number(msg.payloadString);
      if (tempDataHistory.length < 300) {
        tempDataHistory.push(Number(msg.payloadString));
        console.log("tempDataHitory", tempDataHistory);
      } else {
        tempDataHistory.shift();
        tempDataHistory.push(Number(msg.payloadString));
        console.log("tempDataHitory", tempDataHistory);
      }

      // Calculate temperature average
      if (tempAverageCount < 300) {
        tempAverageCount++;
      }
      tempAverage =
        (tempAverage * (tempAverageCount - 1) + Number(msg.payloadString)) /
        tempAverageCount;
      document.getElementById("avg").innerHTML = tempAverage.toFixed(2);
      document.getElementById("avgGauge").innerHTML = tempAverage.toFixed(2);

      //document.styleSheets[5].style.transform = "rotate(" + (tempAverage/40).toFixed(0) + "deg)";
      break;

    case "timetemp": // Debugging timestemp
      console.log("value", msg.payloadString, "topic", msg.destinationName);
      break;

    case "alarm": // Debugging alarm / indikator
      state_indikator = msg.payloadString;
      if (state_indikator = "1") {
        document.getElementById("alarm").style.backgroundColor = "rgb(231, 76, 60)";
       } else if ((state_indikator = "0")) {
        document.getElementById("alarm").style.background = "rgb( )";
       }
      console.log("value", msg.payloadString, "topic", msg.destinationName);
      break;

    default:
    // Tidak ada data
  }

  /*** UPDATE CHART ***/

  // Jadi chartnya diupdate setiap ada data yang masuk, bkn tiap detik :D
  var time = new Date();
  var update = {
    x: [[time]],
    y: [[tempData]]
  };

  var olderTime = time.setSeconds(time.getSeconds() - 300);
  var futureTime = time.setSeconds(time.getSeconds() + 300);

  var minuteView = {
    xaxis: {
      type: "date",
      range: [olderTime, futureTime]
    }
  };

  Plotly.relayout("graphT", minuteView);
  Plotly.extendTraces("graphT", update, [0]);
}

// Nentuin Subscribe Topic apa aja (Hanya bisa diawal pas konek (?) )
function onConnect() {
  // Once a connection has been made, make a subscription and send a message.

  console.log("Connected ");
  // Subscribe topic
  /// Bwt Grafik, Rata", Gauge
  mqtt.subscribe("temp");
  mqtt.subscribe("timetemp");

  // Bwt Indikator
  mqtt.subscribe("alarm"); // Bwt Indikator DO sesuai ambang (?)
}

/// SKIP AJA
// Setup
function MQTTconnect() {
  console.log("connecting to " + host + " " + port);
  mqtt = new Paho.MQTT.Client(host, port, "clientjs");
  //document.write("connecting to "+ host);
  var options = {
    timeout: 3,
    onSuccess: onConnect,
    onFailure: onFailure
  };
  mqtt.onMessageArrived = onMessageArrived;
  mqtt.connect(options); //connect
}

// Biar connect MQTT terus
function onFailure(message) {
  console.log("Connection Attempt to Host " + host + "Failed");
  setTimeout(MQTTconnect, reconnectTimeout);
}



MQTTconnect();
