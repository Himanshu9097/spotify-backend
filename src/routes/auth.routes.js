const express = require('express');
const router = express.Router();
const authController = require("../controllers/auth.controllers");
const authMiddleware = require("../middlewares/auth.middleware");
const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage()
});

router.post('/register',authController.registerUser);
router.post('/login',authController.loginUser);
router.post('/logout',authController.logoutUser);
router.put('/profile', authMiddleware.authUser, upload.single("profileImage"), authController.updateProfile);

module.exports = router;