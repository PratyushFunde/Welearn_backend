const User = require('../models/user');
const bcrypt = require("bcrypt");
const sendEmail = require('../utils/sendEmail');
const { handleOpenRouterPdfUpload, handleGroqPdfUpload } = require('../utils/modelApi');
const jwt = require('jsonwebtoken');
const { createQuestion, createQuestionFromGroq } = require('../utils/createQuestion');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const Interview = require('../models/interview')
const {generateReport}=require("../utils/generateReport");
const { sendAssessmentMail } = require('../utils/sendReport');

exports.test = (req, res) => {
    res.json({ msg: "User router working !" })
}

exports.createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log(existingUser)
            return res.status(409).json({ msg: "User already exists !" });
        }

        const salt = 10;
        const hashedPassword = await bcrypt.hash(password, salt);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

        const newUser = new User({ name, email, password: hashedPassword, otp, otpExpiry });

        await newUser.save();

        await sendEmail(
            email,
            "Verify Your Mail for WeLearn",
            `Your OTP is ${otp}. It will expire in 10 minutes.`,
            `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #4CAF50;">Welcome to WeLearn!</h2>
            <p>Hi <strong>${name}</strong>,</p>
            <p>Thank you for signing up. Please use the following OTP to verify your email:</p>
            <h1 style="color: #333;">${otp}</h1>
            <p>This OTP is valid for <strong>10 minutes</strong>.</p>
            <p style="margin-top: 30px;">Best regards,<br><strong>WeLearn Team</strong></p>
  </div>
  `)

        res.status(200).json({ "msg": "Create user called !", userId: newUser._id, email: newUser.email });
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

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) { return res.status(400).json({ msg: "User not found" }) }

        if (!user.isVerified) {
            return res.status(401).json({ msg: "Please verify your email first !" })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(401).json({ msg: "Invalid Credentials " })

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "1hr" }
        )

        res.status(200).json({
            msg: "Login Successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })

    }
    catch (err) {
        console.error("Some eroor occured in Login : ", err);
        res.status(500).json({ msg: "Server error during login !" })
    }
}

exports.analyzeResume = async (req, res) => {
    try {
        const filePath = req.file.path;
        // const result = await handleOpenRouterPdfUpload(filePath);
        const result = await handleGroqPdfUpload(filePath);
        // console.log(result.candidates.content.parts[0]);
        res.status(200).json(result);
    }
    catch (error) {
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
}

exports.createQuestion = async (req, res) => {
    const { data } = req.body
    const payload = `Create only one behavioural question based on the skills ${data.skills} and experience ${data.experience} include different skills and ask related to the previous question's answer ${data.answer} for interview and give it in json form create only object question called question only question nothing else just question in the json. Keep the question short max two lines.`
    try {
        const response = await createQuestionFromGroq(payload);
        const question = response.choices[0].message.content;
        res.status(200).json(question);
    }
    catch (err) {
        res.status(500).json({ error: `Error in question creation +${err.message}` })
    }

}


exports.addInterview = async (req, res) => {
    try {
        const { userId, userEmail, questions } = req.body;

        // Basic validation
        if (!userId || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: 'userId and questions are required.' });
        }

       

        // Create and save the interview
        const interview = new Interview({ userId, questions });
        const savedInterview = await interview.save();

        const response=await generateReport(questions);
        const report=response.choices[0].message.content;
        console.log(report)
        sendAssessmentMail(userEmail,JSON.parse(report))

        return res.status(201).json({
            message: 'Interview added successfully.',
            interview: savedInterview,
        });
    } catch (error) {
        console.error('Error adding interview:', error);
        return res.status(500).js
    }
}

