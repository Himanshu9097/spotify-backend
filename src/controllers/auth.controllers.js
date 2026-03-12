const userModel = require("../model/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const { uploadFile } = require("../services/storage.service");

async function registerUser(req,res) {

    const {username, email, password, role="user"} = req.body;

    const isUserAlreadyExists = await userModel.findOne({
        $or:[
            {username},
            {email}
        ]
    })

    const hash = await bcrypt.hash(password,10);

    if(isUserAlreadyExists){
        return res.status(409).json({
            message:"user already exists"
        })
    }

    const user = await userModel.create({
        username,
        email,
        password:hash,
        role
    })

    const token = jwt.sign({
        id: user._id,
        role:user.role,
    },process.env.JWT_SECRET)


    res.cookie("token",token);

    res.status(201).json({
        message:"user registered successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email,
            role:user.role,
            profileImage:user.profileImage
        }
    })

}

async function loginUser(req,res) {
    const {username,email,password} = req.body;

    const user = await userModel.findOne({
        $or:[
            {username},
            {email}
        ]
    })

    if(!user){
        return res.status(401).json({
            message:"Invalid Credentials"
        })
    }

    const isPasswordValid = await bcrypt.compare(password,user.password);

    if(!isPasswordValid){
            message:"Invalid Credentials"
        return res.status(401).json({message:"Invalid Credentials"})
    }

    const token = jwt.sign({
        id: user._id,
        role:user.role,
    },process.env.JWT_SECRET)

    res.cookie("token",token)

    res.status(200).json({
        message:"user logged in successfully",
        user:{
            id: user._id,
            username:user.username,
            email:user.email,
            role:user.role,
            profileImage:user.profileImage
        }
    })

}


async function logoutUser(req,res){
    res.clearCookie("token")
    res.status(200).json({message:"user logged out successfully"})
}

async function updateProfile(req, res) {
    try {
        const userId = req.user.id;
        const { username } = req.body;
        const file = req.file;

        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (username && username.trim() && username.trim() !== user.username) {
            // Check if another user has this username
            const existingUser = await userModel.findOne({ username: username.trim(), _id: { $ne: userId } });
            if (existingUser) return res.status(409).json({ message: "Username already taken" });
            user.username = username.trim();
        }

        if (file) {
            try {
                const profileImageObj = await uploadFile(file.buffer, `profile_${userId}_${Date.now()}`, "complete-backend/profiles");
                user.profileImage = profileImageObj.url;
            } catch (uploadErr) {
                console.error("Image upload error:", uploadErr.message);
                return res.status(500).json({ message: "Image upload failed: " + uploadErr.message });
            }
        }

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage
            }
        });
    } catch (err) {
        console.error("Profile update error:", err.message);
        res.status(500).json({ message: err.message || "Failed to update profile" });
    }
}

module.exports = {registerUser,loginUser,logoutUser,updateProfile};
