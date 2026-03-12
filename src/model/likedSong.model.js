const mongoose = require('mongoose');

const likedSongSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        required: true 
    },
    musicId: { 
        type: String, 
        required: true 
    },
    title: { 
        type: String, 
        required: true 
    },
    artist: { 
        type: mongoose.Schema.Types.Mixed // allows object like { username: "Artist" }
    },
    uri: { 
        type: String, 
        required: true 
    },
    image: { 
        type: String 
    },
    isExternal: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true });

// Prevent a user from liking the same song multiple times
likedSongSchema.index({ user: 1, musicId: 1 }, { unique: true });

module.exports = mongoose.model("likedSong", likedSongSchema);
