#include <SoftwareSerial.h>
#include <DHT.h>

#define DHTTYPE DHT22

DHT dht(D4, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  Serial.println("Humidity : " + String(h) + ", Temp : " + String(t));  
  delay(2000);
}
