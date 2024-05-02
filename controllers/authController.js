
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const nodemailer = require('nodemailer');


exports.register = async (req, res) => {
    const { email, password, phone, confirm_password } = req.body;

    try {
        // Check if passwords match
        if (password !== confirm_password) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });

        if (existingUser) {
            let message;
            if (existingUser.email === email) {
                message = 'Email already exists';
            } else {
                message = 'Phone number already exists';
            }
            return res.status(400).json({ message });
        }

        // If neither email nor phone number exists, create a new user
        const otp = generateOTP(); // Generate OTP

        const newUser = new User({
            email,
            password,
            confirm_password,
            phone,
            otp,
        });

        // Save the new user to the database
        await newUser.save();

        // Generate JWT token with email and user ID
        const tokenPayload = {
            email: email,
            userId: newUser.userId,
            tokens: []
        };
        console.log("tokenPayload", tokenPayload);

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );
        tokenPayload.tokens.push(token);

        // Update user document with the generated token
        newUser.tokens.push(token);
        await newUser.save();

        // Send OTP email
        await sendOTP(email, otp); // Function to send OTP email

        res.status(201).json({ message: 'User registered successfully', token, tokenPayload });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Failed to register user', error: error.message });
    }
};


exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        let token;
        try {
            token = jwt.sign(
                {
                    userId: user._id,
                    email: user.email
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRATION }
            );
        } catch (error) {
            return res.status(500).json({ message: 'Error! Something went wrong.' });
        }

        res.json({
            success: true,
            data: {
                userId: user._id,
                email: user.email,
                token: token
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Login failed' });
    }
};


exports.logout = async (req, res) => {
    try {
        // Retrieve the user model from the database using the userId
        const user = await User.findOne({ userId: req.userData.userId });
        console.log('User ID:', req.userData.userId);


        // Set the tokens array to an empty array, indicating logout
        user.tokens = [];

        // Save the updated user document
        await user.save();

        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error logging out:', error);
        res.status(500).json({ message: 'Failed to logout', error: error.message });
    }
};







async function sendOTP(email, otp) {
    // Create a nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // Change this to your SMTP service provider
        auth: {
            user: 'ashish.vishwakarma1267@gmail.com', // Your email address
            pass: 'bwlm vrqy nqdg omsk' // Your email password
        }
    });

    // Setup email data
    const mailOptions = {
        from: 'ashish.vishwakarma1267@gmail.com',
        to: email,
        subject: 'OTP Verification',
        text: `Your OTP for registration is: ${otp}`
    };

    // Send email
    await transporter.sendMail(mailOptions);
}

exports.sendOTP = async (req, res) => {
    const { email, phone } = req.body;

    try {
        const user = await User.findOne({ $or: [{ email }, { phone }] });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        if (!user.otp) {
            return res.status(400).json({ message: 'No OTP found for the user' });
        }

        const otp = user.otp; // Retrieve OTP from the user object
        await sendOTP(email || phone, otp); // Send OTP to either email or phone
        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Failed to send OTP', error: error.message });
    }
};



exports.verifyOTP = async (req, res) => {
    const { email, phone, otp } = req.body;

    try {
        const user = await User.findOne({ $or: [{ email }, { phone }] });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user has an OTP stored
        if (!user.otp) {
            return res.status(400).json({ message: 'No OTP found for the user' });
        }

        // Convert stored OTP and provided OTP to strings for comparison
        const storedOTP = user.otp.toString();
        const providedOTP = otp.toString();

        if (storedOTP !== providedOTP) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Mark OTP as verified
        user.isOtpVerified = true;

        // Exclude confirm_password from the user object before saving
        delete user.confirm_password;

        await user.save();

        res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Failed to verify OTP', error: error.message });
    }
};


function generateOTP() {
    const length = 6;
    const digits = '0123456789';
    let OTP = '';

    for (let i = 0; i < length; i++) {
        const index = Math.floor(Math.random() * digits.length);
        OTP += digits[index];
    }

    return OTP;
}

