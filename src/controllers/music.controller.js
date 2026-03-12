const musicModel = require("../model/music.model");
const albumModel = require("../model/album.model");
const likedSongModel = require("../model/likedSong.model");
const historyModel = require("../model/history.model");
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
            .sort({ createdAt: -1 })
            .limit(10)
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
        const albums = await albumModel.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select("title artist")
            .populate("artist", "username email");

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
        const limit = Math.min(parseInt(req.query.limit) || 10, 10);

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
        let musics = data.tracks.items.map(track => ({
            _id: track.id,
            title: track.name,
            artist: { username: track.artists.map(a => a.name).join(', ') },
            uri: track.preview_url, // Often null due to recent Spotify restrictions
            image: track.album.images[0]?.url, // Highest resolution image
            isExternal: true
        }));

        // Cross-reference with iTunes Search API to retrieve missing audio previews
        musics = await Promise.all(musics.map(async (m) => {
            if (!m.uri) {
                try {
                    const cleanArtist = m.artist.username.split(',')[0];
                    const itunesRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(m.title + ' ' + cleanArtist)}&entity=song&limit=1`);
                    const itunesData = await itunesRes.json();
                    if (itunesData.results && itunesData.results.length > 0 && itunesData.results[0].previewUrl) {
                        m.uri = itunesData.results[0].previewUrl;
                    }
                } catch(e) {
                    // Ignore errors silently for individual failed fetches
                }
            }
            // If iTunes still fails, use fallback royalty-free audio to prevent crashing the player
            if (!m.uri) {
                m.uri = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
            }
            return m;
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

async function toggleLike(req, res) {
    try {
        const { musicId, title, artistName, uri, image, isExternal } = req.body;
        const userId = req.user.id;

        const existingLike = await likedSongModel.findOne({ user: userId, musicId });

        if (existingLike) {
            // Unlike
            await likedSongModel.deleteOne({ _id: existingLike._id });
            return res.status(200).json({ message: "Song unliked", liked: false });
        } else {
            // Like
            await likedSongModel.create({
                user: userId,
                musicId,
                title,
                artist: { username: artistName },
                uri,
                image,
                isExternal: isExternal || false
            });
            return res.status(201).json({ message: "Song liked", liked: true });
        }
    } catch (err) {
        console.error("Error toggling like:", err);
        res.status(500).json({ message: "Error toggling like" });
    }
}

async function getLikedSongs(req, res) {
    try {
        const userId = req.user.id;
        const likedSongs = await likedSongModel.find({ user: userId }).sort({ createdAt: -1 });
        
        // Map to standard player format
        const musics = likedSongs.map(song => ({
            _id: song.musicId, // important: use the original musicId
            title: song.title,
            artist: song.artist,
            uri: song.uri,
            image: song.image,
            isExternal: song.isExternal
        }));

        res.status(200).json({
            message: "Liked songs fetched successfully",
            musics
        });
    } catch (err) {
        console.error("Error fetching liked songs:", err);
        res.status(500).json({ message: "Error fetching liked songs" });
    }
}

async function recordHistory(req, res) {
    try {
        const { musicId, title, artistName, uri, image, isExternal } = req.body;
        const userId = req.user.id;

        // Remove older entry of same song to put it at top
        await historyModel.deleteMany({ user: userId, musicId });

        await historyModel.create({
            user: userId,
            musicId,
            title,
            artist: { username: artistName },
            uri,
            image,
            isExternal: isExternal || false,
            playedAt: new Date()
        });

        res.status(200).json({ message: "History recorded" });
    } catch (err) {
        console.error("Error recording history:", err);
        res.status(500).json({ message: "Error recording history" });
    }
}

async function getHistory(req, res) {
    try {
        const userId = req.user.id;
        const history = await historyModel.find({ user: userId })
            .sort({ playedAt: -1 })
            .limit(20);
        
        const musics = history.map(song => ({
            _id: song.musicId,
            title: song.title,
            artist: song.artist,
            uri: song.uri,
            image: song.image,
            isExternal: song.isExternal
        }));

        res.status(200).json({ musics });
    } catch (err) {
        console.error("Error fetching history:", err);
        res.status(500).json({ message: "Error fetching history" });
    }
}

module.exports = {
    createMusic, 
    createAlbum, 
    getAllMusic, 
    getAllAlbums, 
    getAllAlbumById,
    searchExternalMusic,
    toggleLike,
    getLikedSongs,
    recordHistory,
    getHistory
};