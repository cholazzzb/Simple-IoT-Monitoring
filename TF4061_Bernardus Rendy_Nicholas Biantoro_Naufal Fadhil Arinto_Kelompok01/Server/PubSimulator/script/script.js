///BUAT THERMOMETERNYA

// Calculates the space between each label 
margin = (thermometer.width() + (parseFloat(labels.css('font-size')) / 2)) / ((max - min) / step); 
margin -= parseFloat(labels.css('font-size'));

///BUAT GAUGEYA
var gauge = new RadialGauge({
    renderTo: 'gauge',
    width: 300,
    height: 300,
    units: "RPM",
    value: 35,
    minValue: 0,
    startAngle: 90,
    ticksAngle: 180,
    valueBox: true,
    maxValue: 100,
    majorTicks: [
        "0",
        "20",
        "40",
        "60",
        "80",
        "100",
    ],
    minorTicks: 2,
    strokeTicks: true,
    highlights: [
        {
          "from": 0,
          "to": 60,
          "color": "rgba(100, 255, 100, .2)"
        },
        {
          "from": 60,
          "to": 80,
          "color": "rgba(220, 200, 0, .75)"
        },
        {
            "from": 80,
            "to": 100,
            "color": "rgba(200, 50, 50, .75)"
        }
    ],
    colorPlate: "#fff",
    borderShadowWidth: 0,
    borders: false,
    needleType: "arrow",
    needleWidth: 5,
    needleCircleSize: 2,
    needleCircleOuter: true,
    needleCircleInner: false,
    animationDuration: 1500,
    animationRule: "linear"
}).draw();