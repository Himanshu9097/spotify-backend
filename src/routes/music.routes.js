const express = require('express');
const router = express.Router();
const musicController = require("../controllers/music.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const multer = require('multer');

const upload = multer({
    storage:multer.memoryStorage()
})




router.get("/external/spotify", authMiddleware.authUser, musicController.searchExternalMusic);

router.post("/upload",authMiddleware.authArtist,upload.single("music"),musicController.createMusic);

router.post("/album",authMiddleware.authArtist,musicController.createAlbum);

router.get("/",authMiddleware.authUser,musicController.getAllMusic);

router.get("/albums",authMiddleware.authUser,musicController.getAllAlbums)

router.get("/albums/:albumId",authMiddleware.authUser,musicController.getAllAlbumById)

// Liked Songs
router.post("/liked-songs", authMiddleware.authUser, musicController.toggleLike);
router.get("/liked-songs", authMiddleware.authUser, musicController.getLikedSongs);

// History
router.post("/history", authMiddleware.authUser, musicController.recordHistory);
router.get("/history", authMiddleware.authUser, musicController.getHistory);

module.exports = router;