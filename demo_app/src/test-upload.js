const fs = require('fs')
const path = require('path')
const uploadFile = require('./aws')

const testUpload = () => {
   const filePath = path.resolve(__dirname, 'testdata/test-image.jpg')
   const fileStream = fs.createReadStream(filePath)
   const now = new Date()
   const fileName = `test-image-${now.toISOString()}.jpg`
   uploadFile(fileStream, fileName)
      .then((response) => {
         console.log(":)")
         console.log(response)
      }).catch((err) => {
         console.log(":|")
         console.log(err)
      })
}

let i = 0;
setInterval(() => {
   console.log('Infinite Loop Test interval n:', i++);
   testUpload()
}, 5000)