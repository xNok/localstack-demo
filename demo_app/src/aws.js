require('dotenv').config()

// // Require AWS Node.js SDK
const AWS = require('aws-sdk')
// // Require logplease
// const logplease = require('logplease');
// // Set external log file option
// logplease.setLogfile('debug.log');
// // Set log level
// logplease.setLogLevel('DEBUG');
// // Create logger
// const logger = logplease.create('logger name');
// // Assign logger to SDK
// AWS.config.logger = logger;

const credentials = {
   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
   secretAccessKey: process.env.AWS_SECRET_KEY,
}

const bucketName = process.env.AWS_S3_BUCKET_NAME
const endpoint   = process.env.LOCALSTACK_ENDPOINT

const s3client = new AWS.S3({
   credentials,
   /**
    * When working locally, we'll use the Localstack endpoints. This is the one for S3.
    * A full list of endpoints for each service can be found in the Localstack docs.
    */
   endpoint: endpoint,
   sslEnabled: false,
   s3ForcePathStyle: true
})

/* For Testing purpose */
var request = function(operation, params) {
   return s3client.makeRequest(operation, params);
};

var build = function(operation, params) {
   return request(operation, params).build().httpRequest;
};

function createBucket() {
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

async function uploadFile(data, filename) {
   uploadConfig = {
      Bucket: bucketName,
      Key: `${filename}`,
      Body: data,
      ContentType: "image/jpg",
      ACL: 'public-read',
   }

   // var req = build('headObject', uploadConfig);
   // console.log(`DEBUG / hostname: ${req.endpoint.hostname}, path: ${req.path}`)

   console.log(`host: ${endpoint}, bucket: ${bucketName}`)

   return await new Promise((resolve, reject) => {
      s3client.upload(uploadConfig,
         (err, response) => {
            if (err)
               reject(err)
            resolve(response)
         }
      )
   })
}

module.exports = { uploadFile, createBucket }