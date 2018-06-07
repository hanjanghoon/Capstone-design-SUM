#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <SoftwareSerial.h>
#include <DHT.h>
#include <SDS011.h>

SoftwareSerial mySerial(D7, D8);
DHT dht(D4, DHT22);
SDS011 sds;
byte cmd[9] = {0xFF, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79};
byte response[9];

const char * host = "ec2-13-209-19-156.ap-northeast-2.compute.amazonaws.com";
String url = "/update?";
const int httpPort = 3000;

const char* ssid     = "AndroidAP1081";
const char* password = "12345679";

void setup() {
  Serial.begin(9600);

  // Initialize
  dht.begin();
  sds.begin(D1, D2);
  mySerial.begin(9600);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.print("\n Got WiFi, IP address: ");
  Serial.println(WiFi.localIP()); 
}
void loop()
{
  // Read humidity and temperature (humidity : 0 ~ 100%, temperature : -40 ~ 80`C)
  float hum = dht.readHumidity(), temp = dht.readTemperature();
  while (isnan(hum) || isnan(temp)) {
    hum = dht.readHumidity();
    temp = dht.readTemperature();
  }

  // Read p25 and p10 (0.0 ~ 999.9)
  float p25, p10;
  sds.read(&p25, &p10);
  while (p25 == 0 || p10 == 0) {
    sds.read(&p25, &p10);
  }
  if(p25 > 999.99) p25 = 999.99;
  if(p10 > 999.99) p10 = 999.99;

  // Read ppm (0 ~ 5000)
  int ppm=-1;
  while(0 > ppm || ppm> 5000){
    mySerial.write(cmd, 9);
    mySerial.readBytes(response, 9);
    if (response[8] != (0xff & (~(response[1] + response[2] + response[3] + response[4] + response[5] + response[6] + response[7]) + 1))) {
     while (mySerial.available() > 0) {
        mySerial.read();
      }
    }
  ppm = (response[2] << 8) | response[3];
  }
  // Read times
  // unsigned long times = millis();

  // Print for Debugging
  //Serial.println("Humidity : " + String(hum) + ", Temperature : " + String(temp));
  //Serial.println("P25 : " + String(p25) + ", P10 : " + String(p10));
  //Serial.println("PPM : " + String(ppm));
  //Serial.println("Times : " + String(times));
  //Serial.println();

  WiFiClient client;
  while (!client.connect(host, httpPort)) {
    Serial.println("connection failed: ");
    delay(500);
  }
  String tab_name= "indoor";
  String payload = 
    "tab_name=" + String(tab_name)+
    "&humidity=" + String(hum) + 
    "&temperature=" + String(temp) + 
    "&dust_pm25=" + String(p25) + 
    "&dust_pm10=" + String(p10) + 
    "&co2=" + String(ppm);
  String getheader = "GET " + String(url) + "&" + String(payload) + " HTTP/1.1";
  client.println(getheader);
  client.println("User-Agent: ESP8266 Capston-Design-SUM");  
  client.println("Host: " + String(host));  
  client.println("Connection: close");
  client.println();

  Serial.println(getheader);
  while (client.connected()) {
    String line = client.readStringUntil('\n');
    Serial.println(line);
  }

  delay(54500);
}
