/*
  24 October 2019 Wemos Client-Side with MQTT Communication Protocol
  as originally designed by Bernardus Rendy (13317041)
  Integrated with Server-Side Javascript as designed by Nicholas Biantoro (13317043)
  Integrated with Server-Side Front End as designed by Naufal Fadhil Arinto (13317014)
*/
// ************************************************ ******* LIBRARY IMPORT AND DEFINITION *******************************************//
//LIBRARY
#include <ESP8266WiFi.h>
#include <PubSubClient.h>

//INPUT BUTTONS
#define BUTTON1 D6
#define BUTTON2 D7
#define BUTTON3 D8

//INPUT ANALOG LDR
#define LDRPIN A0

//OUTPUT DIGITAL DAN ANALOG LED-LEDRGB
#define LEDRGBG D4 //D4 is Green
#define LEDRGBR D3 //D3 is Red
#define LEDRGBB D2 //D2 is Blue
#define LED D1 //White LED
#define LEDALARM D0 //Red alarm LED

//NETWORK AND MQTT SERVER
const char* ssid = "AndroidAP_9667";
const char* password = "12345678";
const char* mqtt_server = "192.168.43.175";

// ******************************************************* USER INTERFACE INPUT AND OUTPUT *******************************************//
//VARIABLE DIGITAL AND ANALOG INPUT
int button1=0; //button 1 changes auto/manual mode
int button2=0; //button 2 changes on/off white led
int button3=0; //button 3 changes on/off rgb led
int ldr=0; //ldr analog input

//DIGITAL INPUT PROCESS
boolean s1IsPressed() { 
  //POPO Input for button1
  static boolean b1_old = 1;
  boolean b1 = digitalRead(BUTTON1);
  boolean s1 = (b1&&!b1_old);
  b1_old = b1;
  return s1;
}
boolean s2IsPressed() {
  //POPO Input for button2
  static boolean b1_old = 1;
  boolean b1 = digitalRead(BUTTON2);
  boolean s1 = (b1&&!b1_old);
  b1_old = b1;
  return s1;
}
boolean s3IsPressed() {
  //POPO Input for button3
  static boolean b1_old = 1;
  boolean b1 = digitalRead(BUTTON3);
  boolean s1 = (b1&&!b1_old);
  b1_old = b1;
  return s1;
}

// *********************************************************STATE AND FLOW CONTROL*********************************************** //
//STATE CHANGING VARIABLE
int state_auto=0; //Auto if = 1, manual if = 0
int state_led=0; //Turn on if = 1, off if = 0
int state_rgb=0; //Turn on if = 1, off if = 0
int state_alarm=0; //Turn on if = 1, off if = 0
int threshold=400; //Threshold value for auto mode
int r=255; //Red component of rgb
int g=255; //Green component of rgb
int b=255; //blue component of rgb

//CALLBACK CHAR ARRAY
char strauto[8]; //string for autoManual
char strled[8]; //string for digitalLed
char strrgb[8]; //string for digitalLedRGB
char strr[8]; //string for analogLedR
char strg[8]; //string for analogLedG
char strb[8]; //string for analogLedB
char strthreshold[8]; //string for threshold

//PUBLISH CHAR ARRAY
char strldr[8]; //string for analogLDR
char stralarm[8]; //string for alarm


// ***************************************************** MQTT AND WIRELESS COMMUNICATION ********************************************//
//INITIATE WiFi OBJECT
WiFiClient espClient;
PubSubClient client(espClient);
long lastMsg=0; //Temporary variable for message timing

//SETUP WiFi CONNECTION
void setup_wifi() {
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  // Waiting until connected
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  randomSeed(micros());
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

//CALLBACK FUNCTION
void callback(char* topic, byte* payload, unsigned int length) {
  //String conversion for conditional purposes
  String strtopic=topic; 
  //Topic conditionals
  if (strtopic=="autoManual"){
    strauto[0]=(char)payload[0];
  }
  else if (strtopic=="digitalLed"){
    strled[0]=(char)payload[0];
  }
  else if (strtopic=="digitalLedRGB"){
    strrgb[0]=(char)payload[0];
  }
  else if (strtopic=="analogLedR"){
    memset(strr, 0, sizeof(strr));
    for (int i = 0; i < length; i++) {
      strr[i]=(char)payload[i];
    }
  }
  else if (strtopic=="analogLedG"){
    memset(strg, 0, sizeof(strg));
    for (int i = 0; i < length; i++) {
      strg[i]=(char)payload[i];
    }
  }
  else if (strtopic=="analogLedB"){
    memset(strb, 0, sizeof(strb));
    for (int i = 0; i < length; i++) {
      strb[i]=(char)payload[i];
    }
  }
  else if (strtopic=="threshold"){
    memset(strthreshold, 0, sizeof(strthreshold));
    for (int i = 0; i < length; i++) {
      strthreshold[i]=(char)payload[i];
    }
  }
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    
    // Create a random client ID
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    
    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      client.subscribe("autoManual");
      client.subscribe("digitalLed");
      client.subscribe("digitalLedRGB");
      client.subscribe("analogLedR");
      client.subscribe("analogLedG");
      client.subscribe("analogLedB");
      client.subscribe("threshold");
      } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

// ******************************************************************SETUP AND LOOP*********************************************** //
//WEMOS SETUP
void setup() {
  pinMode(BUTTON1,INPUT); //D6
  pinMode(BUTTON2,INPUT); //D7
  pinMode(BUTTON3,INPUT); //D8
  pinMode(LDRPIN,INPUT); //A0
  pinMode(LEDRGBG,OUTPUT); //D4 is green
  pinMode(LEDRGBR,OUTPUT); //D3 is Red
  pinMode(LEDRGBB,OUTPUT); //D2 is Blue
  pinMode(LED,OUTPUT); //D1 is White
  pinMode(LEDALARM,OUTPUT); //D0 is White Alarm
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

//WEMOS LOOP
void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  long now=millis();
  
  //DIGITAL INPUT CLIENT AND SERVER CONTROLLED STATE CHANGE AND VARIABLE CONVERSION
  button1=s1IsPressed();
  button2=s2IsPressed();
  button3=s3IsPressed();
  if(button1||button2||button3){
    if(button1){
      state_auto=!state_auto;
      snprintf (strauto, 8, "%d", state_auto);
      client.publish("autoManual",strauto);
    }
    if(button2&&!state_auto){
      state_led=!state_led;
      snprintf (strled, 8, "%d", state_led);
      client.publish("digitalLed",strled);
    }
    if(button3&&!state_auto){
      state_rgb=!state_rgb;
      snprintf (strrgb, 8, "%d", state_rgb);
      client.publish("digitalLedRGB",strrgb);
    } 
  }
  else{
    state_auto=atoi(strauto);
    state_led=atoi(strled);
    state_rgb=atoi(strrgb);
  }
  
  //ANALOG INPUT SERVER VARIABLE CONVERSION
  r=atoi(strr);
  g=atoi(strg);
  b=atoi(strb);
  threshold=atoi(strthreshold);
  ldr=analogRead(LDRPIN);
  snprintf (strldr, 8, "%d", ldr); //Convert LDR Reading to Char Array for Publishing Purposes
  
  //AUTO STATE CHANGE
  if (state_auto){
      digitalWrite(LED,LOW);
      analogWrite(LEDRGBR,0);
      analogWrite(LEDRGBG,0);
      analogWrite(LEDRGBB,0);
    if (ldr<(threshold*1023/500)){
      int last_state_alarm=state_alarm;
      state_alarm=1;
      if(state_alarm==!last_state_alarm){
        snprintf (stralarm, 8, "%d", state_alarm);
        client.publish("alarm",stralarm);
      }
    }
    else {
      int last_state_alarm=state_alarm;
      state_alarm=0;
      if(state_alarm==!last_state_alarm){
        snprintf (stralarm, 8, "%d", state_alarm);
        client.publish("alarm",stralarm);
      }
    }
  }
  
  //MANUAL STATE CHANGE
  else if (!state_auto){
    if (state_led){
      digitalWrite(LED,HIGH);
    }
    else{
      digitalWrite(LED,LOW);
    }
    if (state_rgb){
      analogWrite(LEDRGBR,r);
      analogWrite(LEDRGBG,g);
      analogWrite(LEDRGBB,b);
    }
    else{
      analogWrite(LEDRGBR,0);
      analogWrite(LEDRGBG,0);
      analogWrite(LEDRGBB,0);
    }
  }

  //ALARM STATE CHANGE
  if (state_alarm){
    digitalWrite(LEDALARM,HIGH);
    
  }
  else{
    digitalWrite(LEDALARM,LOW);
  }
  
  //PUBLISH EVERY ONE SECOND
  if (now - lastMsg > 1000) {
    lastMsg = now;
    client.publish("analogLDR",strldr);
  }
  delay(10);
}
