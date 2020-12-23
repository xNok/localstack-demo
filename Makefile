.PHONY: all

AWS_BUCKET_NAME=demo-bucket
LOCALSTACK_HOSTNAME=localstack

all: demo_app localstack mb upload ls

demo_app:
	@docker-compose build

localstack:
	@docker-compose up -d

# Create the bocket
mb:
	@aws --endpoint-url=http://localhost:4566 s3 mb s3://${AWS_BUCKET_NAME} && aws --endpoint-url=http://localhost:4566 s3api put-bucket-acl --bucket ${AWS_BUCKET_NAME} --acl public-read

# list the content of th bucket
ls:
	@aws --endpoint-url=http://localhost:4566 s3 ls s3://${AWS_BUCKET_NAME} --recursive --human-readable --summarize

# Upload a test image from local
upload:
	@aws --endpoint-url=http://localhost:4566 s3 sync ./demo_app/testdata s3://${AWS_BUCKET_NAME}

# List images using aws-cli docker image
ls-docker: 
	@docker run --network localstack-demo_default -v ~/.aws:/root/.aws --rm -it amazon/aws-cli --endpoint-url=http://${LOCALSTACK_HOSTNAME}:4566 s3 ls s3://${AWS_BUCKET_NAME} --recursive --human-readable --summarize

clean:
	@docker-compose down