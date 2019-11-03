/**
 * Originally created by Nicholas Biantoro 29 Oktober 2019
 * Integrated with Wemos Embedded System created by @Bernardus Rendy and
 * Web Frontend by @Fadhil Arinto
 */

// # Gambaran Besar Isi scripts.js :
// ## 1. Deklarasi Variabel
// ### 1.1 Untuk MQTTconnect
// ### 1.2 Variabel Global
// ### 1.3 Untuk isi pesan yg di Publish
// ### 1.4 State Variabel yang akan dipublish
// ### 1.5 State Subscribe

// ## 2. Plot awal Grafik

// ## 3. Script Logic Interaktif Dengan HTML & CSS

// ## 4. Void Button
// ### Berisi publish message jika ditekan

// ## 5. MQTT function + Update Chart
// ### function onMessageArrived(msg) => mengolah pesan yang diterima dari broker
// ### Update chart tiap ada data yang diterima dari broker melalui subsribe

// ## 6. Subsribe topic
// ### function onConnect() => indikator udh connect dan subsribe topicnya

// ## 7. function MQTTconnect() => Setup connect diawal

// ## 8 .function onFailure(message) => Kalau gagal connect coba connect lagi


/***** 1. DEKLARASI VARIABEL *****/
  /*** 1.1 Untuk MQTTconnect ***/
  var mqtt;
  var reconnectTimeout = 2000;
  var host = "localhost";
  var port = 3000;
    
  /***** 1.2 Variabel Global *****/ 
  var time = new Date();
  var lightData;
  var lightDataHistory = [];
  var lightAverage = 0;
  var lightAverageCount = 0;
  var movingAverage = [];
  // RGB value
  var R = 0;
  var G = 0;
  var B = 0;

  /***** 1.3 Untuk isi pesan yg di Publish *****/
  var wemos = ""; // Isi pesan yang dipublish ke wemos
  
  /***** 1.4 State Variabel yang akan dipublish *****/ 
  // State Publish
  var state_automanual = "0"; // (1 = auto, 0 = manual)
  var state_DO = "0"; // (1 = nyala, 0 = mati)
  var state_DORGB = "0"; // (1 = nyala, 0 = mati)
  var state_threshold = 0; // (0-)
  // State lokal DO & DORGB
  var state_local_DO ="0"; // State lokal untuk logic auto manual
  var state_local_DORGB = "0"; // -,,- untuk LED RBG
  
  /***** 1.5 State Subscribe *****/ 
  var state_indikator = ""; 
  var state_analogLDR = "";
  var state_analogHum = "";
  var state_analogTem = "";
  
  
  /*** 2. PLOT AWAL GRAFIK ***/
  // Isi grafik
  var LDR = {
    x: [time],
    y: [lightData],
    mode: "lines",
    line: { color: "#80CAF6" }
  };
  var MovingAverage = {
    x: [time],
    y: [0],
    mode: "lines",
    line: { color: "#4caf50" }
  };
  
  // Konfigurasi Layout
  var layout1 = {
    title: {
      text: "LDR History",
      font: {
        family: "sans-serif",
        size: "20",
        color: "Purple"
      },
    }
  };
  // Plot
  Plotly.plot("graphH", [LDR, MovingAverage], layout1);
  

  /***** 3. SCRIPT LOGIC INTERAKTIF DENGAN HTML & CSS *****/
  
  /// SLIDER R
  var sliderR = document.getElementById("sliderR"); // Ambil slider
  var sliderValR = document.getElementById("sliderValR"); // Ambil Value
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
  
  // Update the current slider value display (each time you drag the slider handle)
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
  
  // Send to Wemos ketika slider sudah tidak ditekan lagi
  sliderR.onchange = function() {
    // Build the message
    message1 = new Paho.MQTT.Message(R.toString()); // Membuat objek untuk pesan yang dikirim melewati MQTT
    message1.destinationName = "analogLedR"; // Menentukan nilai topik
    // Send the message / Publish
    mqtt.send(message1);
    console.log("Publish ledR"); //Untuk Debugging
    console.log(R);
  };
  sliderG.onchange = function() {
    message1 = new Paho.MQTT.Message(G.toString());
    message1.destinationName = "analogLedG";
    // Send the message / Publish
    mqtt.send(message1);
    console.log("Publish ledG");
    console.log(G);
  };
  sliderB.onchange = function() {
    message1 = new Paho.MQTT.Message(B.toString());
    message1.destinationName = "analogLedB";
    // Send the message / Publish
    mqtt.send(message1);
    console.log("Publish ledB");
    console.log(B);
  };
  sliderThreshold.onchange = function() {
    message1 = new Paho.MQTT.Message(state_threshold.toString());
    message1.destinationName = "threshold";
    // Send the message / Publish
    mqtt.send(message1);
    console.log("Publish threshold");
    console.log(state_threshold);
  };
  
  /***** 4. VOID BUTTON *****/
  // Jika ditekan akan mempublish messages
  function changeStatus1() {
    console.log(state_automanual);
    switch (state_automanual) {
      case "0": // tombol mati
        state_automanual = "1";
        break;
      case "1": // tombol nyala
        state_automanual = "0";
        break;
      default:
    }
  
    // Build the message
    message1 = new Paho.MQTT.Message(state_automanual);
    message1.destinationName = "autoManual";
    // Send the message / Publish
    mqtt.send(message1);
    console.log("Publish AutoManual");
    console.log(state_automanual);
  }
  
  function changeStatus2() {
    console.log(typeof state_DO);
    console.log(state_DO);
    switch (state_DO) {
      case "0": // LED mati
        state_DO = "1";
        break;
      case "1": // LED nyala
        state_DO = "0";
        break;
      default:
    }
    // Build the message
    message1 = new Paho.MQTT.Message(state_DO);
    message1.destinationName = "digitalLed";
    // Send the message / Publish
    mqtt.send(message1);
    console.log("Publish StateDO");
    console.log(state_DO);
  }
  
  function changeStatus3() {
    switch (state_DORGB) {
      case "0": // LED mati
        state_DORGB = "1";
        break;
      case "1": // LED nyala
        state_DORGB = "0";
        break;
      default:
     }
      // Build the message
      message1 = new Paho.MQTT.Message(state_DORGB);
      message1.destinationName = "digitalLedRGB";
      // Send the message / Publish
      mqtt.send(message1);
  }
  
  /*** AUTOMATIC MQTT FUNCTIONS ***/
  /***** 5. MQTT FUNCTION + UPDATE CHART *****/
  // Logic bwt ngolah data di web
  // Petunjut praktis
  // msg.destinationName = return topic yang diterima
  // msg.payloadString = return isi message dari topic berupa string
  
  function onMessageArrived(msg) {
    switch (msg.destinationName) {
      case "analogLDR": // Get Data from analogLDR topic
        state_analogLDR = Number(msg.payloadString)*500/1024; //konversi nilai bacaan LDR
        lightData = state_analogLDR;
        document.getElementById("avgGauge").innerHTML = state_analogLDR;
        document.getElementById("ldrvaluerot").style.transform =
          "rotate(" + (state_analogLDR / 500) * 180 + "deg)"; // Untuk Slider
  
          // Sebagai memory data 5 menit setelah sistem dijalankan
          if (lightDataHistory.length < 300) {
            lightDataHistory.push(state_analogLDR);
          } else {
            lightDataHistory.shift();
            lightDataHistory.push(state_analogLDR);
          }
  
          // Calculate LDR average
          if (lightAverageCount < 300) {
            lightAverageCount++;
          }
          lightAverage =
            (lightAverage * (lightAverageCount - 1) + lightData) /
            lightAverageCount;
          document.getElementById("avgH").innerHTML = lightAverage.toFixed(2);
          // Logic untuk movingAverage
          if (movingAverage.length < 300) {
            movingAverage.push(lightAverage);
            console.log("movingAverage", movingAverage);
          } else {
            movingAverage.shift();
            movingAverage.push(lightAverage);
          }
        console.log("value", msg.payloadString, "topic", msg.destinationName);
        break;
  
      case "autoManual": // Get Data from autoManual topic
        state_automanual = msg.payloadString;
        switch (state_automanual) {
          case "0": // LED mati
            document.getElementById("butAutoManual").style.backgroundColor =
              "rgb(231, 76, 60)";
            break;
          case "1": // LED nyala
            document.getElementById("butAutoManual").style.backgroundColor =
              "rgb(46, 204, 113)";
            break;
          default:
            // Tidak ada data
            document.getElementById("butAutoManual").style.backgroundColor =
              "white";
        }
        console.log("value", msg.payloadString, "topic", msg.destinationName);
        break;
  
      case "digitalLed": // Get Data from digital LED topic
        state_DO = msg.payloadString;

        // Logic untuk mematikan fungsi button apabila sedang dalam mode auto
        if (state_automanual == "1"){
          state_local_DO = state_DO + "ganggu";
        }
        else {
          state_local_DO = state_DO;
        }
        switch (state_local_DO) {
          case "0": // LED mati
            document.getElementById("butLED").style.backgroundColor =
              "rgb(231, 76, 60)";
            break;
          case "1": // LED nyala
            document.getElementById("butLED").style.backgroundColor =
              "rgb(46, 204, 113)";
            break;
          default:
            // Tidak ada data
            document.getElementById("butLED").style.backgroundColor = "white";
        }
        break;
  
      case "digitalLedRGB": // Sama tapi bwt yang LED berwarna
        state_DORGB = msg.payloadString;
        if (state_automanual == "1"){
          state_local_DORGB = state_DORGB + "ganggu";
        }
        else {
          state_local_DORGB = state_DORGB;
        }
        switch (state_local_DORGB) {
          case "0": // LED mati
            document.getElementById("butLEDRGB").style.backgroundColor =
              "rgb(231, 76, 60)";
            break;
          case "1": // LED nyala
            document.getElementById("butLEDRGB").style.backgroundColor =
              "rgb(46, 204, 113)";
            break;
          default:
            // Tidak ada data
            document.getElementById("butLEDRGB").style.backgroundColor = "white";
        }
        console.log("value", msg.payloadString, "topic", msg.destinationName);
        break;
  
        case "alarm": //  alarm / indikator
          state_indikator = msg.payloadString;
          if (state_indikator == "1") {
            document.getElementById("alarm").style.background = "red";
          } else if (state_indikator == "0") {
            document.getElementById("alarm").style.background = "black";
          }
          console.log("value", state_indikator, "topic", msg.destinationName);
          break;
  
      default:
      // Tidak ada data
    }
  
    /*** UPDATE CHART ***/
  
    // Chartnya diupdate setiap ada data yang diterima dari broker (1 detik)
    var time = new Date();
    // Isi data baru
    var update1 = {
      x: [[time], [time]],
      y: [[lightData], [lightAverage]]
    };
  
    // Konfigurasi sumbu X yang berjalan
    var olderTime = time.setSeconds(time.getSeconds() - 300);
    var futureTime = time.setSeconds(time.getSeconds() + 300);
    var minuteView = {
      xaxis: {
        type: "date",
        range: [olderTime, futureTime]
      }
    };
    // Update grafik agar real time dan bergeser ke kiri
    Plotly.relayout("graphH", minuteView);
    Plotly.extendTraces("graphH", update1, [0, 1]);
  }
  
  /***** 6. SUBSCRIBE TOPIC *****/
  function onConnect() {
    // Once a connection has been made, make a subscription and send a message.
    console.log("Connected ");
    // Subscribe topic
    /// Bwt Gauge
    mqtt.subscribe("analogLDR");
  
    // Bwt Indikator dan bacaan DHT
    mqtt.subscribe("alarm"); // Bwt alarm DO sesuai ambang
  
    // Bwt Komunikasi 2 arah pada button"
    mqtt.subscribe("autoManual");
    mqtt.subscribe("digitalLed");
    mqtt.subscribe("digitalLedRGB");
  }
  
  /// SKIP AJA
  /***** 7. function MQTTconnect() => Setup connect diawal*****/
  function MQTTconnect() {
    console.log("connecting to " + host + " " + port);
    mqtt = new Paho.MQTT.Client(host, port, "clientjs");
    var options = {
      timeout: 3,
      onSuccess: onConnect,
      onFailure: onFailure
    };
    mqtt.onMessageArrived = onMessageArrived;
    mqtt.connect(options); //connect
  }
  
  /***** 8. function onFailure(message) => Kalau gagal connect coba connect lagi *****/
  function onFailure(message) {
    console.log("Connection Attempt to Host " + host + "Failed");
    setTimeout(MQTTconnect, reconnectTimeout);
  }
  
  // called when the client loses its connection
  function onConnectionLost(responseObject) {
   console.log('oow');
    if (responseObject.errorCode !== 0) {
      console.log("onConnectionLost:" + responseObject.errorMessage);
    }
  }
  
  // EKSEKUSI SEMUANYA
  MQTTconnect();
  