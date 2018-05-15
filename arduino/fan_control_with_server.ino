#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>

const char * host = "ec2-13-209-19-156.ap-northeast-2.compute.amazonaws.com";
String url = "/read";
const int httpPort = 3000;

const char* ssid     = "1234";
const char* password = "sgusjrnfl1!";

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);

  pinMode(D2, OUTPUT);
  pinMode(D3, OUTPUT);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.print("\n Got WiFi, IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // put your main code here, to run repeatedly:
  WiFiClient client;
  while (!client.connect(host, httpPort)) {
    Serial.println("connection failed: ");
    delay(500);
  }
  String getheader = "GET " + String(url) + " HTTP/1.1";
  client.println(getheader);
  client.println("User-Agent: ESP8266 Capston-Design-SUM");
  client.println("Host: " + String(host));
  client.println("Connection: close");
  client.println();

  String line;
  while (client.connected()) {
    line = client.readStringUntil('\n');
    // Serial.println(line);
  }
  Serial.println("flag : " + line);

  if (line == "0") { // on
    Serial.println("now on...");
    digitalWrite(D2, HIGH);
    digitalWrite(D3, LOW);
    digitalWrite(D4, HIGH);
  }
  else if (line == "1") { // off
    Serial.println("now of...");
    digitalWrite(D2, LOW); 
    digitalWrite(D3, LOW);
    digitalWrite(D4, LOW);
  }
  delay(2500);
}
