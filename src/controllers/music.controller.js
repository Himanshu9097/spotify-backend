const musicModel = require("../model/music.model");
const albumModel = require("../model/album.model");
const {uploadFile} = require("../services/storage.service");

async function createMusic(req, res) {
    try {
        const {title} = req.body;
        const file = req.file;

        const result = await uploadFile(file.buffer.toString('base64'));

        const music = await musicModel.create({
            uri: result.url,
            title,
            artist: req.user.id, // comes from middleware
        });

        res.status(201).json({
            message: "Music created successfully",
            music: {
                id: music._id,
                uri: music.uri,
                title: music.title,
                artist: music.artist,
            }
        });

    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Error creating music"});
    }
}

async function createAlbum(req, res) {
    try {
        const {title, musics} = req.body;

        const album = await albumModel.create({
            title,
            artist: req.user.id, // comes from middleware
            musics: musics,
        });

        res.status(201).json({
            message: "Album created successfully",
            album: {
                id: album._id,
                title: album.title,
                artist: album.artist,
                musics: album.musics,
            }
        });
    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Error creating album"});
    }
}

async function getAllMusic(req, res) {
    try {
        const musics = await musicModel
        .find()
        .limit(5)
        .populate("artist");

        res.status(200).json({
            message: "Musics fetched successfully",
            musics: musics,
        });
    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Error fetching musics"
        });
    }
}

async function getAllAlbums(req, res) {
    try {
        const albums = await albumModel.find().select("title artist").populate("artist", "username email");

        res.status(200).json({
            message: "Albums fetched successfully",
            albums: albums 
        });
    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Error fetching albums"
        });
    }
}

async function getAllAlbumById(req, res) {
    try {
        const albumId = req.params.albumId;

        const album = await albumModel.findById(albumId)
            .populate("artist", "username email")
            .populate("musics", "title uri"); 
        if(!album) {
            return res.status(404).json({
                message: "Album not found"
            });
        }

        res.status(200).json({
            message: "Album fetched successfully",
            album: album
        });
    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Error fetching album"
        });
    }
}

module.exports = {
    createMusic, 
    createAlbum, 
    getAllMusic, 
    getAllAlbums, 
    getAllAlbumById
};