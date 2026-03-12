const express = require('express');
const router = express.Router();
const playlistController = require("../controllers/playlist.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// All playlist routes require the user to be logged in
router.use(authMiddleware.authUser);

// Create a new playlist
router.post("/", playlistController.createPlaylist);
// Get all playlists for the logged-in user
router.get("/", playlistController.getUserPlaylists);
// Get a specific playlist
router.get("/:id", playlistController.getPlaylistById);
// Rename a playlist
router.put("/:id", playlistController.renamePlaylist);
// Add a song to the playlist
router.post("/:id/add-song", playlistController.addSongToPlaylist);

module.exports = router;
