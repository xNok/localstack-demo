.PHONY: localstack mb ls demo_app

AWS_BUCKET_NAME=demo-bucket
LOCALSTACK_HOSTNAME=localstack

localstack:
	@docker-compose up

demo_app:
	@docker-compose build

# Create the bocket
mb:
	@aws --endpoint-url=http://localhost:4566 s3 mb s3://${AWS_BUCKET_NAME} && aws --endpoint-url=http://localhost:4566 s3api put-bucket-acl --bucket ${AWS_BUCKET_NAME} --acl public-read

# list the content of th bucket
ls:
	@aws --endpoint-url=http://localhost:4566 s3 ls s3://${AWS_BUCKET_NAME} --recursive --human-readable --summarize

upload:
	@aws --endpoint-url=http://localhost:4566 s3 sync ./demo_app/testdata s3://${AWS_BUCKET_NAME}

ls-docker: 
	@docker run --network localstack-demo_default -v ~/.aws:/root/.aws --rm -it amazon/aws-cli --endpoint-url=http://${LOCALSTACK_HOSTNAME}:4566 s3 ls s3://${AWS_BUCKET_NAME} --recursive --human-readable --summarize