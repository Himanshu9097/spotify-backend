const musicModel = require("../model/music.model");
const albumModel = require("../model/album.model");
const {uploadFile} = require("../services/storage.service");

async function createMusic(req, res) {
    try {
        const {title} = req.body;
        const file = req.file;

        const result = await uploadFile(file.buffer.toString('base64'), file.originalname);

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

let spotifyToken = null;
let spotifyTokenExpiresAt = 0;

async function getSpotifyToken() {
    if (spotifyToken && Date.now() < spotifyTokenExpiresAt) {
        return spotifyToken;
    }
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
        throw new Error("Missing Spotify credentials in .env (SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET)");
    }

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Basic " + Buffer.from(clientId + ":" + clientSecret).toString('base64')
        },
        body: "grant_type=client_credentials"
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error_description || "Could not get token");
    
    spotifyToken = data.access_token;
    spotifyTokenExpiresAt = Date.now() + ((data.expires_in - 60) * 1000); // 1 min buffer
    return spotifyToken;
}

async function searchExternalMusic(req, res) {
    try {
        const query = req.query.q || "top hits";
        const limit = req.query.limit || 20;

        const token = await getSpotifyToken();
        
        // Fetch from Spotify API
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || "Spotify API error");
        }
        
        // Map Spotify data to our standard player format
        // Only return tracks that have a preview_url (some Spotify tracks don't allow 30s previews)
        const musics = data.tracks.items
            .filter(track => track.preview_url)
            .map(track => ({
                _id: track.id,
                title: track.name,
                artist: { username: track.artists.map(a => a.name).join(', ') },
                uri: track.preview_url,            // 30s MP3 preview
                image: track.album.images[0]?.url, // Highest resolution image
                isExternal: true
            }));

        res.status(200).json({
            message: "External musics fetched successfully",
            musics: musics
        });
    } catch(err) {
        console.log("External search error:", err.message || err);
        res.status(500).json({
            message: "Error fetching external musics: " + (err.message || "Unknown error")
        });
    }
}

module.exports = {
    createMusic, 
    createAlbum, 
    getAllMusic, 
    getAllAlbums, 
    getAllAlbumById,
    searchExternalMusic
};