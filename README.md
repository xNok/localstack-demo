A basic demo setting up Localstack's S3.

Read the tutorial [here](https://dev.to/goodidea/how-to-fake-aws-locally-with-localstack-27me).

Or, spin things up here:

1. Install [Docker](https://docs.docker.com/install/) if you haven't already.
2. Install the [AWS CLI](https://aws.amazon.com/cli/). Even though we aren't going to be working with "real" AWS, we'll use this to talk to our local docker containers.
  - Run `aws configure` to set up some credentials. You can enter dummy credentials here if you'd like.
3. Copy the contents of `.env.example` into a new `.env` file. 
4. Run the demo `make`

Look at the result: `make ls`
