const {ImageKit} = require("@imagekit/nodejs");

const ImageKitClient = new ImageKit({
    privateKey: process.env['IMAGEKIT_PRIVATE_KEY'],
})

async function uploadFile(file, originalName) {
    const result = await ImageKitClient.files.upload({
        file,
        fileName: originalName || ("music_" + Date.now()),
        folder: "complete-backend/music"
    })

    return result;
}

module.exports = {uploadFile};