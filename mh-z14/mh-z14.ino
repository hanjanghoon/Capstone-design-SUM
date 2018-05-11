#include <SoftwareSerial.h>
SoftwareSerial mySerial(D7, D8);
  
byte cmd[9] = {0xFF,0x01,0x86,0x00,0x00,0x00,0x00,0x00,0x79}; 
byte response[9]; 
String ppmString = " ";
void setup() {
  Serial.begin(9600);
  mySerial.begin(9600);
}
void loop() 
{
  mySerial.write(cmd,9);
  mySerial.readBytes(response, 9);
  byte chck = 0;
  
  if(response[8] == (0xff&(~(response[1]+response[2]+response[3]+response[4]+response[5]+response[6]+response[7]) + 1))){
    Serial.println("OK");
  }
  else {
    Serial.print("chksum : ");
    Serial.println(response[8],HEX);
    Serial.print("read : ");
    Serial.println(0xff&(~(response[1]+response[2]+response[3]+response[4]+response[5]+response[6]+response[7]) + 1),HEX);
    while(mySerial.available() > 0){
      mySerial.read();
    }
  }
  
  int ppm = (response[2] << 8)|response[3];
  ppmString = String(ppm); //int to string
  
  Serial.print("PPM ");
  Serial.println(ppm);
  delay(2000);
}

