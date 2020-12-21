.PHONY: localstack mb ls demo_app

AWS_BUCKET_NAME=demo-bucket
was

localstack:
	@docker-compose up

demo_app:
	@docker-compose build

# Create the bocket
mb:
	@aws --endpoint-url=http://localhost:4566 s3 mb s3://${AWS_BUCKET_NAME} && aws --endpoint-url=http://localhost:4566 s3api put-bucket-acl --bucket ${AWS_BUCKET_NAME} --acl public-read

ls:
	@aws --endpoint-url=http://localhost:4566 s3 ls