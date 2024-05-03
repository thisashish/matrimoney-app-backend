const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const authenticateUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        console.log(token, 'token');
        if (!token) {
            return res.status(401).json({ success: false, message: "Error! Token was not provided." });
        }
        // Verify the token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        console.log("decodedToken", decodedToken);

        // Attach user data to request for further processing
        req.userData = { userId: decodedToken.userId, email: decodedToken.email };
        console.log(req.userData, 'userData');
        next(); // Call next middleware
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};


// Controller function for super admin login
exports.superAdminLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({ email });

        // Check if admin exists
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, admin.password);

        // If password is invalid, return error
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Assuming password validation is successful, generate a new token
        const tokenPayload = {
            email: admin.email,
            adminId: admin._id,
            role: 'superadmin' // Assuming super admin role
        };

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );

        // Store token in the admin document
        admin.tokens = [token];
        await admin.save();

        // Return success response with token
        res.status(200).json({ message: 'Super Admin Login successful', token });
    } catch (error) {
        // Handle errors
        console.error('Error logging in super admin:', error);
        res.status(500).json({ message: 'Failed to login super admin', error: error.message });
    }
};


module.exports = authenticateUser;
