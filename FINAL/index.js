var mosca = require("mosca");
var settings = {
  http: {
    // Using HTTP protocol
    port: 3000,
    bundle: true,
    static: "./public" // Serving public folder
  }
};

// Create server with settings = 'settings"
var server = new mosca.Server(settings);

// When a Client is connected, print 'client connected' and it's id in terminal
server.on("clientConnected", function(client) {
  console.log("client connected", client.id);
});

// fired when a message is received
server.on("published", function(packet, client) {
  console.log("Published", packet.payload);
});

server.on("ready", setup);

// fired when the mqtt server is ready
function setup() {
  console.log("Mosca server is up and running");
}
