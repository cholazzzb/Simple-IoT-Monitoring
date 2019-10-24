var mqtt = require('mqtt')

// Create client Object
var client  = mqtt.connect([{ host: 'localhost', port: 3000 }])
data = 10000;

// Connect to Mosca server
client.on('connect', function () {
    // client.publish('topic1', '2')
    
    // loop every 10000 ms
	setInterval(function(){ 
        
        
        // var time = new Date();
        // var sec = time.getSeconds();
        // var mils = time.getMilliseconds();
        // var timestamp = sec.toString() + '.' + mils.toString();
        
        
        // Publish temp in topic : temp
        client.publish('digitalLedRGB', "1");
        client.publish('analogLDR', data.toString());

        data++;

        if (data == 10010){
            data = 10000;
        }

        // client.publish('timetemp', timestamp);

        // Console.log is used to print "" in terminal
        console.log("Published!");
       }, 1000);
    
});