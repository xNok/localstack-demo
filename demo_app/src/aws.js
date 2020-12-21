const S3 = require('aws-sdk/clients/s3')
require('dotenv').config()

const credentials = {
   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
   secretAccessKey: process.env.AWS_SECRET_KEY,
}

const bucketName = process.env.AWS_S3_BUCKET_NAME
const hostUrl    = process.env.LOCALSTACK_HOST

const s3client = new S3({
   credentials,
   /**
    * When working locally, we'll use the Localstack endpoints. This is the one for S3.
    * A full list of endpoints for each service can be found in the Localstack docs.
    */
   endpoint: hostUrl
})

function createBucket(){
   var params = {
      Bucket: bucketName, /* required */
      ACL: private | public-read | public-read-write | authenticated-read,
      CreateBucketConfiguration: {
        LocationConstraint: af-south-1 | ap-east-1 | ap-northeast-1 | ap-northeast-2 | ap-northeast-3 | ap-south-1 | ap-southeast-1 | ap-southeast-2 | ca-central-1 | cn-north-1 | cn-northwest-1 | EU | eu-central-1 | eu-north-1 | eu-south-1 | eu-west-1 | eu-west-2 | eu-west-3 | me-south-1 | sa-east-1 | us-east-2 | us-gov-east-1 | us-gov-west-1 | us-west-1 | us-west-2
      },
      GrantFullControl: bucketName,
      GrantRead: bucketName,
      GrantReadACP: bucketName,
      GrantWrite: bucketName,
      GrantWriteACP: bucketName,
      ObjectLockEnabledForBucket: true || false
    };

    s3client.createBucket(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
    });
}

function uploadFile(data, name) {
   console.log(`host: ${hostUrl}, bucket: ${bucketName}`)

   return new Promise((resolve, reject) => {
      s3client.upload(
         {
            Bucket: bucketName,
            /*
               include the bucket name here. For some reason Localstack needs it.
               see: https://github.com/localstack/localstack/issues/1180
            */
            Key: `${bucketName}/${name}`,
            Body: data,
         },
         (err, response) => {
            if (err)
               reject(err)
            resolve(response)
         }
      )
   })
}

module.exports = { uploadFile, createBucket }