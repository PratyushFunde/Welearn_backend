const User = require('../models/user');
const bcrypt = require("bcrypt");
const sendEmail = require('../utils/sendEmail');
const jwt=require('jsonwebtoken');

exports.test=(req,res)=>{
    res.json({msg:"User router working !"})
}

exports.createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.ststus(400).json({ msg: "User already exists !" });
        }

        const salt = 10;
        const hashedPassword = await bcrypt.hash(password, salt);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

        const newUser = new User({ name, email, password: hashedPassword, otp, otpExpiry });

        await newUser.save();

        await sendEmail(
            email,
            "Verify Your Mil for WeLearn",
            `Your OTP is ${otp}. It will expire in 10 minutes.`)

        res.status(200).json({ "msg": "Create user called !", userId: newUser._id ,email:newUser.email});
    } catch (error) {
        console.error("Error in creating user : ", error);
        res.status(500).json({ msg: "Server error in creating user" })
    }
}

exports.verifyOtp = async (req, res) => {

    try {

        const { email, otp } = req.body;

        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ msg: "User not found" });

        if (user.isVerified) return res.status(400).json({ msg: "User already verified" });

        if (user.otp !== otp || new Date() > user.otpExpiry) {
            return res.status(400).json({ msg: "Invalid or expired OTP" });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;

        await user.save();

        res.status(200).json({ "msg": "Verified Successfully" })

    } catch (error) {
        console.error("OTP verification error:", error);
        res.status(500).json({ msg: "Server error" });
    }

}

exports.loginUser=async(req,res)=>{
    try{
        const {email,password}=req.body;

        const user=await User.findOne({email});

        if(!user){return res.status(400).json({msg:"User not found"})}

        if(!user.isVerified)
        {
            return res.status(401).json({msg:"Please verify your email first !"})
        }

        const isMatch=await bcrypt.compare(password,user.password);

        if(!isMatch) return res.status(401).json({msg:"Invalid Credentials"})

        const token=jwt.sign(
            {userId:user._id,email:user.email},
            process.env.JWT_SECRET,
            {expiresIn:process.env.JWT_EXPIRES_IN || "1hr"}
        )

        res.status(200).json({
            msg:"Login Successsful",
            token,
            user:{
                id:user._id,
                name:user.name,
                email:user.email
            }
        })

    }
    catch(err)
    {
        console.error("Some eroor occured in Login : ",err);
        res.status(500).json({msg:"Server error during login !"})
    }
}

