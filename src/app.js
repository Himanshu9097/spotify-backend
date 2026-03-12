const express = require("express")
const cookieParser = require("cookie-parser");
const authRoutes = require('./routes/auth.routes');
const musicRoutes = require('./routes/music.routes');

const playlistRoutes = require('./routes/playlist.routes');

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get("/",(req,res)=>{
    res.status(200).json({
        message:"Welcome to the Music App API"
    })
})


app.use('/api/auth', authRoutes);
app.use('/api/music',musicRoutes);
app.use('/api/playlists', playlistRoutes);

module.exports = app;