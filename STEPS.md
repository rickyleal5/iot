# Guide to reproduce project

* You need AWS + Serverless credentials, and their CLIs + docker + node + git + postgres installed.
* You need to add the parameters, the TimescaleDB VPC info in the CloudFormation files.
* You have to add the provider, environment variables, and secrets in the Serverless App.
* You have to update the serverless.yaml file and add the subnets and security group ID for TimescaleDB.
* You need a Raspberry Pi connected to an ultrasonic distance sensor (HC-SR04).
* You need to create a database service on TimescaleDB Cloud and create a VPC there.
*

## Steps
Install:
```console
serverless plugin install -n serverless-ignore
npm i
```

#### AWS Part 1

Validate CloudFormation Files
```console
aws cloudformation validate-template --template-body file://cloudformation/ecr-grafana.yaml
aws cloudformation validate-template --template-body file://cloudformation/ecs-grafana.yaml
aws cloudformation validate-template --template-body file://cloudformation/iot.yaml
aws cloudformation validate-template --template-body file://cloudformation/s3-bucket.yaml
aws cloudformation validate-template --template-body file://cloudformation/vpc.yaml
```

Create S3 Bucket to store CloudFormation files
```console
aws cloudformation create-stack --stack-name grafana-project-files-bucket --template-body file://cloudformation/s3-bucket.yaml
```

Push the CloudFormation files to S3
```console
aws s3 sync ./cloudformation s3://cloudformation-templates-for-this-project
```

Create VPC
```console
aws cloudformation create-stack --stack-name grafana-iot-project-vpc --template-url https://cloudformation-templates-for-this-project.s3.amazonaws.com/vpc.yaml 
```

#### TimescaleDB Cloud
Create service on TimescaleDB Cloud (in the same region as your AWS VPC).
Connect to it with postgres client and create role for Grafana.
```sql
CREATE ROLE grafana WITH LOGIN PASSWORD '< type a password >';
```
You can use the setUpDb.js tool in iot/aws-lambda-iot to create the tables for this project. However, you have to update the env. variables for the `setUpDb` script.
```console
cd aws-lambda-iot
npm i
npm run setUpDb
```
Create a VPC for the service (in the same region as your AWS VPC) and attach it to the service. I used a 192.168.0.0/24 CIRD block for this VPC (Make sure it doesn't overlap with the AWS VPC CIDR block).
Request a peering conection to your AWS VPC.
Add peering connection to the route tables

#### Serverless
Add the provider, environment variables, and secrets in the Serverless App (You need them for serverless.yaml).
Deploy Serverless service
```console
npm run deploy
cd .. #back to iot/
```

#### AWS Part 2

Create ECR Repo and IoT device
```console
aws cloudformation create-stack --stack-name grafana-iot-project-ecr-grafana --template-url https://cloudformation-templates-for-this-project.s3.amazonaws.com/ecr-grafana.yaml  
aws cloudformation create-stack --stack-name grafana-iot-project-things --template-url https://cloudformation-templates-for-this-project.s3.amazonaws.com/iot.yaml 
```

Create Docker image and push it to AWS ECR
```console
aws ecr get-login-password --region <AWS REGION> | docker login --username AWS --password-stdin <AWS ACCOUNT>.dkr.ecr.<AWS REGION>.amazonaws.com
cd grafana
docker build -t grafana .
docker tag grafana:latest <AWS ACCOUNT>.dkr.ecr.<AWS REGION>.amazonaws.com/grafana:latest
docker push <AWS ACCOUNT>.dkr.ecr.<AWS REGION>.amazonaws.com/grafana:latest
cd .. #back to iot/
```
Create ECS Fargate service
```console
aws s3 cp ./grafana/.env s3://cloudformation-templates-for-this-project
```
Before running the next command, copy the Arn of the .env file and add it to the ecs-grafana.yaml CloudFormation file
```console
aws cloudformation create-stack --stack-name grafana-iot-project-ecs-grafana --template-url https://cloudformation-templates-for-this-project.s3.amazonaws.com/ecs-grafana.yaml --capabilities CAPABILITY_NAMED_IAM 
```

#### Raspberry Pi
Copy the raspberrypi folder into the rasberry pi.
Create the AWS IoT certificates for the Raspberry Pi and copy them in the certs folder. Rename the certificates or change the .env file to point to them.
Run the python script as sudo to access the ping command.
```console
sudo pip3 -r requirements.txt
sudo python iot.py
```


## Remove project


Remove AWS Lambdas using Serverless
```console
cd aws-lambda-iot
npm run remove
```
Remove Cloudformation stacks
```console
cd .. #back to iot/
aws cloudformation delete-stack --stack-name grafana-iot-project-ecs-grafana 
aws cloudformation delete-stack --stack-name grafana-iot-project-things 
aws cloudformation delete-stack --stack-name grafana-iot-project-ecr-grafana 
aws cloudformation delete-stack --stack-name grafana-iot-project-vpc 
```

Delete the files in the S3 bucket
```console
aws s3api delete-object --bucket <S3 BUCKET> --key ecr-grafana.yaml
aws s3api delete-object --bucket <S3 BUCKET> --key ecs-grafana.yaml
aws s3api delete-object --bucket <S3 BUCKET> --key iot.yaml
aws s3api delete-object --bucket <S3 BUCKET> --key s3-bucket.yaml
aws s3api delete-object --bucket <S3 BUCKET> --key vpc.yaml
aws s3api delete-object --bucket <S3 BUCKET> --key .env
```

Remove S3 bucket
```console
aws cloudformation delete-stack --stack-name grafana-project-files-bucket
```

Remove Docker image
```console
docker rmi <IMAGE ID> -f
```

**Optional**
Clear your ~/.bash_history if you typed in passwords in it
```console
bash ./tools/erase-bash-history.sh
```