const playlistModel = require("../model/playlist.model");

async function createPlaylist(req, res) {
    try {
        const userId = req.user.id;
        const newPlaylist = await playlistModel.create({
            name: "My Playlist #" + Math.floor(Math.random() * 1000),
            user: userId,
            songs: []
        });
        res.status(201).json({ message: "Playlist created", playlist: newPlaylist });
    } catch (err) {
        console.error("Create playlist error:", err);
        res.status(500).json({ message: "Failed to create playlist" });
    }
}

async function getUserPlaylists(req, res) {
    try {
        const userId = req.user.id;
        const playlists = await playlistModel.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json({ playlists });
    } catch (err) {
        console.error("Get playlists error:", err);
        res.status(500).json({ message: "Failed to get playlists" });
    }
}

async function getPlaylistById(req, res) {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const playlist = await playlistModel.findOne({ _id: id, user: userId });
        if (!playlist) return res.status(404).json({ message: "Playlist not found" });
        res.status(200).json({ playlist });
    } catch (err) {
        console.error("Get playlist by ID error:", err);
        res.status(500).json({ message: "Failed to get playlist" });
    }
}

async function renamePlaylist(req, res) {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { name } = req.body;
        const playlist = await playlistModel.findOneAndUpdate(
            { _id: id, user: userId },
            { name: name || "Untitled Playlist" },
            { new: true }
        );
        res.status(200).json({ message: "Playlist renamed", playlist });
    } catch (err) {
        console.error("Rename playlist error:", err);
        res.status(500).json({ message: "Failed to rename playlist" });
    }
}

async function addSongToPlaylist(req, res) {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { musicId, title, artistName, uri, image, isExternal } = req.body;
        
        const playlist = await playlistModel.findOne({ _id: id, user: userId });
        if (!playlist) return res.status(404).json({ message: "Playlist not found" });
        
        // Ensure not already in playlist
        const exists = playlist.songs.some(s => s.musicId === musicId);
        if (exists) {
            return res.status(400).json({ message: "Song already in playlist" });
        }
        
        playlist.songs.push({
            musicId,
            title,
            artistName: artistName || 'Unknown Artist',
            uri,
            image,
            isExternal: isExternal || false
        });
        
        await playlist.save();
        res.status(200).json({ message: "Song added", playlist });
    } catch (err) {
        console.error("Add song error:", err);
        res.status(500).json({ message: "Failed to add song" });
    }
}

module.exports = {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    renamePlaylist,
    addSongToPlaylist
};
