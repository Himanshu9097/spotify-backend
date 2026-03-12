const {ImageKit} = require("@imagekit/nodejs");

const ImageKitClient = new ImageKit({
    privateKey: process.env['IMAGEKIT_PRIVATE_KEY'],
})

async function uploadFile(file, originalName, folder = "complete-backend/music") {
    const result = await ImageKitClient.files.upload({
        file,
        fileName: originalName || ("file_" + Date.now()),
        folder
    })

    return result;
}

module.exports = {uploadFile};