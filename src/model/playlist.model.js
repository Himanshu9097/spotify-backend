const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: 'New Playlist'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    songs: [{
        musicId: String,
        title: String,
        artistName: String, // Stored as a flat string
        uri: String,
        image: String,
        isExternal: Boolean
    }]
}, { timestamps: true });

module.exports = mongoose.model("playlist", playlistSchema);
