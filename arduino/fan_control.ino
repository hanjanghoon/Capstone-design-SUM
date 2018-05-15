void setup() {
  pinMode(D2, OUTPUT);
  pinMode(D3, OUTPUT);
}

void loop() {

        // fan operate
        digitalWrite(D2, HIGH);
        digitalWrite(D3,LOW);
        digitalWrite(D4, HIGH);
        delay(5000);

        // fan stop
        digitalWrite(D2, LOW);
        digitalWrite(D3, LOW);
        digitalWrite(D4, LOW);
        delay(5000);
        
       
       
 }
