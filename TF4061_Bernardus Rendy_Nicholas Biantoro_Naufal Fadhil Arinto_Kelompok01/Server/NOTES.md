# Gambaran Besar Isi Script.js :
## 1. Deklarasi Variabel
### 1.1 Untuk MQTTconnect
### 1.2 Untuk isi pesan yg di Publish
### 1.3 State Publish dan campuran
### 1.4 State RGB
### 1.5 State Subscribe

## 2. Plot awal Grafik

## 3. Script bwt HTML (Slider)

## 4. Void Button
### Isinya ada publish publish message kalau ditekan

## 5. MQTT function
### function onMessageArrived(msg) => ngolah pesan yang diterima dari broker
### Update chart tiap ada data yang diterima dari broker melalui subsribe

## 6. Subsribe topic
### function onConnect() => indikator udh connect dan subsribe topicnya

## 7. function MQTTconnect() => Setup connect diawal

## 8 .function onFailure(message) => Kalau gagal connect coba connect lagi