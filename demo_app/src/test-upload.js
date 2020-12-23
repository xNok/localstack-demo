const fs = require('fs')
const path = require('path')
const { uploadFile, createBucket }  = require('./aws')

function testUpload () {
   const filePath = path.resolve(__dirname, '../testdata/test-image.jpg')
   const fileStream = fs.createReadStream(filePath)
   const now = new Date()
   const fileName = `test-image-${now.toISOString()}.jpg`
   return uploadFile(fileStream, fileName).then((response) => {
         console.log(":)")
         console.log(response)
         console.log("-------------------------------")
      }).catch((err) => {
         console.log(":|")
         console.log(err)
         console.log("-------------------------------")
      })
}

const forLoop = async _ => {
   console.log('Start')
 
   for (let index = 0; index < 10; index++) {
      console.log("loop ", index)
      await testUpload()
      console.log('Sleep')
      await new Promise(resolve => setTimeout(resolve, 5000));
      console.log("endloop", index)
   }
 
   console.log('End')
 }

forLoop()