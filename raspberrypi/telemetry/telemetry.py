import RPi.GPIO as GPIO
import os
from time import sleep, time
from dotenv import load_dotenv
from pythonping import ping

load_dotenv()

# GPIO config
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
## Pins
GPIO_TRIGGER = int(os.getenv('GPIO_TRIGGER'))
GPIO_ECHO = int(os.getenv('GPIO_ECHO'))
## GPIO setup
GPIO.setup(GPIO_TRIGGER, GPIO.OUT)
GPIO.setup(GPIO_ECHO, GPIO.IN)
 

def getTelemetry():
    timestamp = round(time()*1000)
    distance = getDistance()
    ping_ms = getPing()

    return {'time': timestamp, 'distance': distance, 'ping': ping_ms}

def getDistance():
    GPIO.output(GPIO_TRIGGER, True)
    sleep(0.00001)
    GPIO.output(GPIO_TRIGGER, False)
 
    start_time = time()
    stop_time = time()
 
    while GPIO.input(GPIO_ECHO) == 0:
        start_time = time()
 
    while GPIO.input(GPIO_ECHO) == 1:
        stop_time = time()
 
    roundtrip_time = stop_time - start_time
    
    # Calculate one-way trip distance in cm/s 
    distance = round((roundtrip_time * float(os.getenv('SONIC_SPEED')) * 100) / 2, 2)

    return distance

def getPing():
    ping_ms = -1
    try:
        ping_ms = ping(os.getenv('ENDPOINT')).rtt_avg_ms
    except:
        print('Failed to ping endpoint')
        
    return ping_ms
