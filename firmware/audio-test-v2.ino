// This #include statement was automatically added by the Particle IDE.
#include "Particle.h"
#include <ADCDMAGen3_RK.h>


SYSTEM_THREAD(ENABLED);

// Mirror SETUP/MODE button on D1 pin. Button pressed state - LOW
STARTUP(System.buttonMirror(D1, FALLING));

SerialLogHandler logHandler;

const size_t SAMPLES_IN_BUFFER = 1024;

static nrf_saadc_value_t buffer0[SAMPLES_IN_BUFFER];
static nrf_saadc_value_t buffer1[SAMPLES_IN_BUFFER];

static nrf_saadc_value_t *bufferReady = 0;

// If you don't hit the setup button to stop recording, this is how long to go before turning it
// off automatically. The limit really is only the disk space available to receive the file.
const unsigned long MAX_RECORDING_LENGTH_MS = 60000;

// Set LED pin
const int LED_PIN = D6;

// This is the IP Address and port that the audioServer.js node server is running on.
IPAddress serverAddr = IPAddress(192,168,43,215);
int serverPort = 7123;

TCPClient client;
unsigned long recordingStart;
ADCDMAGen3 adc;

enum State { STATE_WAITING, STATE_CONNECT, STATE_RUNNING, STATE_FINISH };
State state = STATE_WAITING;

// Forward declarations
void buttonHandler(system_event_t event, int data);


void setup() {
	// Register handler to handle clicking on the SETUP button
	System.on(button_click, buttonHandler);

	// Red LED indicates recording is on
	pinMode(LED_PIN, OUTPUT);

	// Optional, just for testing so I can see the logs below
	// waitFor(Serial.isConnected, 10000);

	adc.withBufferCallback([](nrf_saadc_value_t *buf, size_t size) {
		// This gets executed after each sample buffer has been read.
		// Note: This is executed in interrupt context, so beware of what you do here!

		// We just remember the buffer and handle it from loop
		bufferReady = buf;
	});

	ret_code_t err = adc
		.withSampleFreqHz(16000)
        .withDoubleBuffer(SAMPLES_IN_BUFFER, buffer0, buffer1)
        .withResolution(NRF_SAADC_RESOLUTION_8BIT)
		.withSamplePin(A0)
		.init();

	Log.info("adc.init %lu", err);

	// Start sampling!
	adc.start();

}


void loop() {

	switch(state) {
	case STATE_WAITING:
		// Waiting for the user to press the SETUP button. The setup button handler
		// will bump the state into STATE_CONNECT
		break;

	case STATE_CONNECT:
		// Ready to connect to the server via TCP
		if (client.connect(serverAddr, serverPort)) {
			// Connected
			Log.info("starting");

			recordingStart = millis();
			digitalWrite(LED_PIN, HIGH);

			state = STATE_RUNNING;
		}
		else {
			Log.info("failed to connect to server");
			state = STATE_WAITING;
		}
		break;

	case STATE_RUNNING:
		if (bufferReady) {
	    	int16_t *samples = (int16_t*)bufferReady;
    	    bufferReady = 0;
    	    for (int i = 0; i < SAMPLES_IN_BUFFER; i++) {
    	      samples[i] -= 2048;  // transpose 0 .. +4095 to -2048 .. +2047 
    	      samples[i] <<= 8;    // 8bit -> 16bit
    	    }
		    
		    // Send buffer data to server with TCP client
		    size_t count = client.write((uint8_t*)samples, SAMPLES_IN_BUFFER * 2);

		}

		if (millis() - recordingStart >= MAX_RECORDING_LENGTH_MS) {
			state = STATE_FINISH;
		}
		break;

	case STATE_FINISH:
		digitalWrite(LED_PIN, LOW);
		client.stop();
		Log.info("stopping");
		state = STATE_WAITING;
		break;
	}
}


// button handler for the SETUP button, used to toggle recording on and off
void buttonHandler(system_event_t event, int data) {
	switch(state) {
	case STATE_WAITING:
		state = STATE_CONNECT;
		break;

	case STATE_RUNNING:
		state = STATE_FINISH;
		break;
	}
}
