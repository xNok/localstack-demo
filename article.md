---
title: How to fake AWS locally with LocalStack
published: true
description: A brief tutorial on setting up LocalStack + Node to simulate Amazon S3 locally
tags: node, tutorial, aws, docker
---

If you're anything like me, you prefer to avoid logging into the AWS console as much as possible. Did you set up your IAM root user with 2FA and correctly configure the CORS and ACL settings on your S3 bucket?

# 🤷‍♂️ nah.

I also prefer to keep my local development environment as close as possible to how it's going to work in production. Additionally, I'm always looking for new ways to fill up my small hard drive. I can't think of a better away to achieve all of the above than putting a bunch of S3 servers inside my computer.

This tutorial will cover setting up [Localstack](https://github.com/localstack/localstack) within a node app. Localstack allows you to emulate a number of AWS services on your computer, but we're just going to use S3 in this example. Also, Localstack isn't specific to Node - so even if you aren't working in Node, a good portion of this tutorial will still be relevant. This also covers a little bit about Docker - if you don't really know what you're doing with Docker or how it works, don't worry. Neither do I.

You can see the [demo repo](https://github.com/good-idea/localstack-demo) for the finished code.

A few benefits of this approach are:

 - You can work offline
 - You don't need a shared 'dev' bucket that everyone on your team uses
 - You can easily wipe & replace your local buckets
 - You don't need to worry about paying for AWS usage
 - You don't need to log into AWS 😛

## Initial Setup

First, we'll need to install a few things.

1. Install [Docker](https://docs.docker.com/install/) if you haven't already.
2. Install the [AWS CLI](https://aws.amazon.com/cli/). Even though we aren't going to be working with "real" AWS, we'll use this to talk to our local docker containers.
3. (Optional) Install [make]() this let you run the command defined in the `Makefile`


### Docker Config

You can run Localstack directly from the command line, but I like using Docker because it makes me feel smart. It's also nice because you don't need to worry about installing Localstack on your system. I prefer to use docker-compose to set this up. Here's the config:

[docker-compose.yml](docker-compose.yml)


Breaking some of these lines down:

#### `image: localstack/localstack:latest`

Use the latest [Localstack image from Dockerhub](https://hub.docker.com/r/localstack/localstack/) 


#### `container_name: localstack`

This gives our container a specific name that we can refer to later in the CLI and call it from other cpntainer with a fixe name

#### `environment`

These are environment variables that are supplied to the container. Localstack will use these to set some things up internally:

- `SERVICES=s3`: You can define a list of AWS services to emulate. In our case, we're just using S3, but you can include additional APIs, i.e. `SERVICES=s3,lambda`. There's more on this in the Localstack docs.
- `DEBUG=1`: 🧻 Show me all of the logs!
- `DATA_DIR=/tmp/localstack/data`: This is the directory where Localstack will save its data *internally*. More in this next:


#### `volumes`

`'./.localstack:/tmp/localstack'`

Remember when set up the `DATA_DIR` to be `/tmp/localstack/data` about 2 seconds ago? Just like the `localhost:container` syntax we used on the ports, this allows your containers to access a portion of your hard drive. Your computer's directory on the left, the container's on the right.

Here, we're telling the container to use our `.localstack` directory for its `/tmp/localstack`. It's like a symlink, or a magical portal, or something.

In our case, this makes sure that any data created by the container will still be present once the container restarts. Note that `/tmp` is cleared frequently and isn't a good place to store. If you want to put it in a more secure place
- `'/var/run/docker.sock:/var/run/docker.sock'`

### Starting our Container

Now that we have our `docker-compose.yml` in good shape, we can spin up the container: `docker-compose up -d`.

To make sure it's working, we can visit http://localhost:4566 to see that Localstack is running. 

```
{"status": "running"}
```

(To run the stack and also create a bucket run `make`. This exectue a sequence a command to setup everything)

## Working with Localstack

AWS is now inside our computer. You might already be feeling a little bit like you are [the richest person in the world](https://www.businessinsider.com/amazon-ceo-jeff-bezos-richest-person-net-worth-billions-2018-12). (If not, don't worry, just keep reading 😛)

Before we start uploading files, we need to create and configure a bucket. We'll do this using the AWS CLI that we installed earlier, using the `--endpoint-url` flag to talk to Localstack instead.

1. Create a bucket: `aws --endpoint-url=http://localhost:4566 s3 mb s3://demo-bucket`
2. Attach an [ACL](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html) to the bucket so it is readable: `aws --endpoint-url=http://localhost:4566 s3api put-bucket-acl --bucket demo-bucket --acl public-read`

Now, when we visit the web UI, we will see our bucket at `http://localhost:4566/demo-bucket`

Here, we can see that Localstack is recording all API calls in this JSON file. When the container restarts, it will re-apply these calls - this is how we are able to keep our data between restarts. Once we start uploading, we won't see new files appear in this directory. Instead, our uploads will be recorded in this file *as raw data*. (You could include this file in your repo if you wanted to share the state of the container with others - but depending on how much you upload, it's going to become a pretty big file)

If you want to be able to "restore" your bucket later, you can make a backup of this file. When you're ready to restore, just remove the updated `s3_api_calls.json` file, replace it with your backup, and restart your container.

### Uploading from our app

There are a lot of S3 uploading tutorials out there, so this section won't be as in-depth. We'll just make a simple `upload` function and try uploading an image a few times.

Copy these contents into their files:

**.env**, our environment variables

```
AWS_ACCESS_KEY_ID='123'
AWS_SECRET_KEY='xyz'
AWS_BUCKET_NAME='demo-bucket'
```

*Note: it doesn't matter what your AWS key & secret are, as long as they aren't empty.*

**aws.js**, the module for our upload function

```js
const AWS = require('aws-sdk')
require('dotenv').config()

const credentials = {
   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
   secretAccessKey: process.env.AWS_SECRET_KEY,
}

const useLocal = process.env.NODE_ENV !== 'production'

const bucketName = process.env.AWS_BUCKET_NAME

const s3client = new AWS.S3({
   credentials,
   /**
    * When working locally, we'll use the Localstack endpoints. This is the one for S3.
    * A full list of endpoints for each service can be found in the Localstack docs.
    */
   endpoint: useLocal ? 'http://localstack:4566' : undefined,
})


const uploadFile = async (data, name) =>
   new Promise((resolve) => {
      s3client.upload(
         {
            Bucket: bucketName,
            Key: `${name}`,
            Body: data,
            /*
               We dont want the sdk to force https
            */
            sslEnabled: false,
            /*
               As of september 2020 path-style is not supported by aws. However localstack did not addrss that issue yet
               Therefore we need this to address backward compatibility
            */
            s3ForcePathStyle: true
         },
         (err, response) => {
            if (err) throw err
            resolve(response)
         },
      )
   })

module.exports = uploadFile
```

**test-upload.js**, which implements the upload function

```js
const fs = require('fs')
const path = require('path')
const uploadFile = require('./aws')

const testUpload = () => {
   const filePath = path.resolve(__dirname, 'test-image.jpg')
   const fileStream = fs.createReadStream(filePath)
   const now = new Date()
   const fileName = `test-image-${now.toISOString()}.jpg`
   uploadFile(fileStream, fileName).then((response) => {
      console.log(":)")
      console.log(response)
   }).catch((err) => {
      console.log(":|")
      console.log(err)
   })
}

testUpload()
```

the `testUpload()` function gets the file contents, gives it a unique name based on the current time, and uploads it. Let's give it a shot:

`node test-upload.js`

(the demo application is also included in the docker-compose as to upload 10 sample images)

You can see the uploaded picture using `aws cli`:

```
$ aws --endpoint-url=http://localhost:4566 s3 ls s3://demo-bucket --recursive --human-readable --summarize
```
```
2020-12-23 09:33:28    9.7 KiB test-image-2020-12-23T14:33:28.572Z.jpg
2020-12-23 09:33:33    9.7 KiB test-image-2020-12-23T14:33:33.594Z.jpg
2020-12-23 09:33:38    9.7 KiB test-image-2020-12-23T14:33:38.626Z.jpg
2020-12-23 09:33:43    9.7 KiB test-image-2020-12-23T14:33:43.646Z.jpg
2020-12-23 09:33:48    9.7 KiB test-image-2020-12-23T14:33:48.671Z.jpg

Total Objects: 5
   Total Size: 48.7 KiB
 ```

**Finally**, let's restart the container to make sure our uploads still work. To do this, run `docker restart localstack_demo`. After it has restarted, run `docker logs -f localstack_demo`. This will show you the logs of the container (the `-f` flag will "follow" them).

After it initializes Localstack, it will re-apply the API calls found in `s3_api_calls.json`:

![Localstack Logs](https://thepracticaldev.s3.amazonaws.com/i/ydjjg14zztr5vvqv9q6s.png)

When you reload your browser, you should see the image appear just as before.

🎉 That's it! Thanks for sticking around. This is my first tutorial and I'd love to know what you think. If you have any questions or suggestions, let me know in the comments!