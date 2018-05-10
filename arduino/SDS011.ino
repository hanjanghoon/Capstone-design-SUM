#include <SoftwareSerial.h>
#include <SDS011.h>

SDS011 sds;
float p25, p10;
int error;

void setup() {
  sds.begin(D1, D2);
  Serial.begin(115200);
}

void loop() {
  error = sds.read(&p25, &p10);
  if(!error){
    Serial.println("p25 : " + String(p25) + ", p10 : " + String(p10));
  }
  delay(1000);
}
