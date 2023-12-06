import RPi.GPIO as GPIO
import json
import os
from time import sleep
from awscrt import mqtt
from telemetry.telemetry import getTelemetry
from aws.aws import getIoTClient
from dotenv import load_dotenv

load_dotenv()
 
if __name__ == '__main__':
    count = 0
    iotClient = None
    try:
        print(f'Connecting to AWS IoT Core with client ID {os.getenv("IoT_ID")}...')
        iotClient = getIoTClient()
        connect_future = iotClient.connect()
        print(f'Connected: {connect_future.result()["session_present"]}')
        
        print('Starting to publish telemetry')
        while True:
            count+=1
            data = getTelemetry()
            
            print('Publishing to AWS IoT Core')
            message = {'iotID': os.getenv("IoT_ID"), 'name': os.getenv('IoT_NAME'), 'telemetry': data}
            iotClient.publish(topic=os.getenv('TOPIC'), payload=json.dumps(message), qos=mqtt.QoS.AT_LEAST_ONCE)
            print(f'Published: {json.dumps(message)} to the topic: {os.getenv("TOPIC")}')
            
            sleep(int(os.getenv('SLEEP_TIME')))
 
    except KeyboardInterrupt:
        print(f'\Published {count} messages')
        print('Stopping IoT device')
        GPIO.cleanup()
        disconnect_future = iotClient.disconnect()
        disconnect_future.result()
    
    print('Done')
    GPIO.cleanup()
