from awscrt import io
from awsiot import mqtt_connection_builder
from dotenv import load_dotenv
import os
load_dotenv()

def getIoTClient():
    event_loop_group = io.EventLoopGroup(1)
    host_resolver = io.DefaultHostResolver(event_loop_group)
    client_bootstrap = io.ClientBootstrap(event_loop_group, host_resolver)
    client = mqtt_connection_builder.mtls_from_path(
                endpoint=os.getenv('ENDPOINT'),
                cert_filepath=os.getenv('PATH_TO_CERTIFICATE'),
                pri_key_filepath=os.getenv('PATH_TO_PRIVATE_KEY'),
                client_bootstrap=client_bootstrap,
                ca_filepath=os.getenv('PATH_TO_AMAZON_ROOT_CA_1'),
                client_id=os.getenv('IoT_ID'),
                clean_session=False,
                keep_alive_secs=6
                )
    return client
