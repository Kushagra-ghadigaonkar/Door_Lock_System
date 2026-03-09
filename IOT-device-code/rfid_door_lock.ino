#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <time.h>

// ================= WIFI =================
#define WIFI_SSID "vivo 2015"
#define WIFI_PASSWORD "23456789"

// ================= FIREBASE =================
#define DATABASE_URL "https://door-lock-system-b5952-default-rtdb.asia-southeast1.firebasedatabase.app/"
#define DATABASE_SECRET "NLwAY200peZUyW7cDvP5ktk8JohlrbcAwdvf98zM"

// ================= RFID =================
#define SS_PIN 5
#define RST_PIN 4

// ================= OUTPUT PINS =================
#define RELAY_PIN 15
#define GREEN_LED 14
#define RED_LED 13
#define BUZZER 25
#define BUTTON_PIN 27

// ================= TIME CONFIG (IST) =================
const char *ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 19800; // IST (UTC +5:30)
const int daylightOffset_sec = 0;

// ================= OBJECTS =================
MFRC522 mfrc522(SS_PIN, RST_PIN);
LiquidCrystal_I2C lcd(0x27, 16, 2);

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

int attemptCount = 0;
unsigned long lastScanTime = 0;

// ================= USER STRUCT =================
struct User
{
    byte uid[4];
    String name;
};

User users[] = {
    {{0x53, 0xA5, 0xF5, 0xF6}, "Janhavi"}};

const int userCount = sizeof(users) / sizeof(users[0]);

// ================= FUNCTIONS =================

String getUserName(byte *uid)
{
    for (int i = 0; i < userCount; i++)
    {
        if (memcmp(uid, users[i].uid, 4) == 0)
        {
            return users[i].name;
        }
    }
    return "Invalid";
}

String uidToString(byte *uid)
{
    String id = "";
    for (byte i = 0; i < 4; i++)
    {
        if (uid[i] < 0x10)
            id += "0";
        id += String(uid[i], HEX);
    }
    id.toUpperCase();
    return id;
}

// ✅ Stable Timestamp Function
String getTimeStamp()
{
    struct tm timeinfo;

    if (!getLocalTime(&timeinfo))
    {
        Serial.println("Time not available, using fallback");
        return String(millis()); // fallback (never "NoTime")
    }

    char buffer[30];
    strftime(buffer, sizeof(buffer), "%Y-%m-%d %H:%M:%S", &timeinfo);
    return String(buffer);
}

void sendToFirebase(int attempt, String cardID, String name, String status)
{

    if (WiFi.status() != WL_CONNECTED)
    {
        Serial.println("WiFi disconnected. Reconnecting...");
        WiFi.reconnect();
        return;
    }

    FirebaseJson json;

    json.set("attempt", attempt);
    json.set("card_id", cardID);
    json.set("emp_name", name);
    json.set("status", status);
    json.set("timestamp", getTimeStamp());

    if (Firebase.RTDB.pushJSON(&fbdo, "/rfid_logs", &json))
    {
        Serial.println("Firebase Updated");
    }
    else
    {
        Serial.println("Firebase Error:");
        Serial.println(fbdo.errorReason());
    }
}

void beep(int times, int duration)
{
    for (int i = 0; i < times; i++)
    {
        digitalWrite(BUZZER, HIGH);
        delay(duration);
        digitalWrite(BUZZER, LOW);
        delay(150);
    }
}

void blinkLED(int pin, int times)
{
    for (int i = 0; i < times; i++)
    {
        digitalWrite(pin, HIGH);
        delay(200);
        digitalWrite(pin, LOW);
        delay(200);
    }
}

// ================= SETUP =================

void setup()
{

    Serial.begin(115200);

    pinMode(RELAY_PIN, OUTPUT);
    pinMode(GREEN_LED, OUTPUT);
    pinMode(RED_LED, OUTPUT);
    pinMode(BUZZER, OUTPUT);
    pinMode(BUTTON_PIN, INPUT_PULLUP);

    digitalWrite(RELAY_PIN, HIGH);

    // WiFi
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.print("Connecting to WiFi");

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }

    Serial.println("\nWiFi Connected");

    // NTP Time Setup
    configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);

    Serial.println("Waiting for NTP time sync...");
    while (time(nullptr) < 100000)
    {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nTime Synced Successfully");

    // Firebase Setup
    config.database_url = DATABASE_URL;
    config.signer.tokens.legacy_token = DATABASE_SECRET;

    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);

    // RFID + LCD Init
    SPI.begin();
    mfrc522.PCD_Init();

    Wire.begin();
    lcd.init();
    lcd.backlight();
    lcd.print("Scan Card...");
}

// ================= LOOP =================

void loop()
{
    // ================= MANUAL BUTTON CONTROL =================
    if (digitalRead(BUTTON_PIN) == LOW)
    { // Button pressed (INPUT_PULLUP logic)

        delay(50); // simple debounce

        if (digitalRead(BUTTON_PIN) == LOW)
        {

            lcd.clear();
            lcd.print("Manual Unlock");

            digitalWrite(RELAY_PIN, LOW); // Relay ON
            delay(3000);
            digitalWrite(RELAY_PIN, HIGH); // Relay OFF

            lcd.clear();
            lcd.print("Scan Card...");

            // Wait until button released (prevents retrigger)
            while (digitalRead(BUTTON_PIN) == LOW)
                ;
        }
    }
    if (millis() - lastScanTime < 2000)
        return;

    if (!mfrc522.PICC_IsNewCardPresent())
        return;
    if (!mfrc522.PICC_ReadCardSerial())
        return;

    lastScanTime = millis();
    attemptCount++;

    String empName = getUserName(mfrc522.uid.uidByte);
    String cardID = uidToString(mfrc522.uid.uidByte);

    lcd.clear();

    if (empName != "Invalid")
    {

        lcd.print("Access Granted");
        lcd.setCursor(0, 1);
        lcd.print(empName);

        blinkLED(GREEN_LED, 2);
        beep(2, 100);

        digitalWrite(RELAY_PIN, LOW);
        delay(3000);
        digitalWrite(RELAY_PIN, HIGH);

        sendToFirebase(attemptCount, cardID, empName, "Granted");
    }
    else
    {

        lcd.print("Access Denied");
        blinkLED(RED_LED, 2);
        beep(3, 200);

        sendToFirebase(attemptCount, cardID, "Invalid", "Denied");

        lcd.clear();
        lcd.print("Scan Card");

        /* while (digitalRead(BUTTON_PIN) == HIGH) {}

         beep(1, 300);

         lcd.clear();
         lcd.print("Manual Unlock");

         digitalWrite(RELAY_PIN, LOW);
         delay(3000);
         digitalWrite(RELAY_PIN, HIGH);*/
    }
    lcd.clear();
    lcd.print("Scan Card...");
    mfrc522.PICC_HaltA();
}