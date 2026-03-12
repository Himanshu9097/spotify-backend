const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    musicId: { type: String, required: true },
    title: { type: String, required: true },
    artist: { type: mongoose.Schema.Types.Mixed },
    uri: { type: String, required: true },
    image: { type: String },
    isExternal: { type: Boolean, default: false },
    playedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("history", historySchema);
