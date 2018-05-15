#include <ESP8266WiFi.h>
#include <OneWire.h>
#include <DallasTemperature.h>

#define myPeriodic 4 //in sec | Thingspeak pub is 15sec
#define ONE_WIRE_BUS 2  // DS18B20 on arduino pin2 corresponds to D4 on physical board
#define ThingSpeak 0
#define IFTTT 1
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature DS18B20(&oneWire);
float prevTemp = 0;
const char* server = "api.thingspeak.com";
const char* server2 ="maker.ifttt.com";
String apiKey ="IR053HYC4T5HIGXF";
String IFTTTKEY="bhLdDKLSFtLmuYJWIBmfhC";
const char* MY_SSID = "U+Net0C9F"; 
const char* MY_PWD = "32F2010751";
String EVENTO="temperature check";
int sent = 0;
void setup() {
  Serial.begin(115200);
  connectWifi();
}

void loop() {
  float temp;
  //char buffer[10];
  DS18B20.requestTemperatures(); 
  temp = DS18B20.getTempCByIndex(0);
  //String tempC = dtostrf(temp, 4, 1, buffer);//handled in sendTemp()
  Serial.print(String(sent)+" Temperature: ");
  Serial.println(temp);
  
  //if (temp != prevTemp)
  //{
  //sendTeperatureTS(temp);
  //prevTemp = temp;
  //}
  
  sendTeperatureTS(temp);
  int count = myPeriodic;
  while(count--)
  delay(1000);
}

void connectWifi()
{
  Serial.print("Connecting to "+*MY_SSID);
  WiFi.begin(MY_SSID, MY_PWD);
  while (WiFi.status() != WL_CONNECTED) {
  delay(1000);
  Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("Connected");
  Serial.println("");  
}//end connect

void sendTeperatureTS(float temp)
{  
   
   WiFiClient client;
   int key=IFTTT;
   if(key==ThingSpeak){

      if (client.connect(server, 80)) { // use ip 184.106.153.149 or api.thingspeak.com
      Serial.println("WiFi Client connected ");
   
      String postStr = apiKey;
      postStr += "&field1=";
      postStr += String(temp);
      postStr += "\r\n\r\n";
   
      client.print("POST /update HTTP/1.1\n");
      client.print("Host: api.thingspeak.com\n");
      client.print("Connection: close\n");
      client.print("X-THINGSPEAKAPIKEY: " + apiKey + "\n");
      client.print("Content-Type: application/x-www-form-urlencoded\n");
      client.print("Content-Length: ");
      client.print(postStr.length());
      client.print("\n\n");
      client.print(postStr);
      delay(1000);
   
      }//end if
      sent++;
    client.stop();
  }
   else if(key==IFTTT){
        
     if (client.connect(server2, 80)) { // use ifttt server
      Serial.println("WiFi Client connected ");
   
    String toSend = "GET /trigger/";
    toSend += EVENTO;
    toSend += "/with/key/";
    toSend += IFTTTKEY;
    toSend += "?value1=";
    toSend += temp;
    toSend += " HTTP/1.1\r\n";
    toSend += "Host: ";
    toSend += server2;
    toSend += "\r\n";
    toSend += "Connection: close\r\n\r\n";

    client.print(toSend);
    delay(1000);
  }
 }
}//end send
