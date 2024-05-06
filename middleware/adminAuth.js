// middleware/adminAuth.js

const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const authenticateAdmin = async (req, res, next) => {
    try {
        // Check if the authorization header is present
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return res.status(401).json({ success: false, message: "Error! Token was not provided." });
        }
        
        // Extract the token from the header
        const token = authorizationHeader.split(' ')[1];

        // Verify the token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the user is an admin
        const admin = await Admin.findOne({ _id: decodedToken.adminId });
        console.log('admin',admin);
        if (!admin) {
            return res.status(403).json({ success: false, message: "User is not authorized as admin." });
        }

        // Attach admin data to request for further processing
        req.admin = admin;
        console.log(req.admin,'req.admin');
        next(); // Call next middleware
    } catch (error) {
        console.error('Error verifying admin token:', error);
        return res.status(401).json({ success: false, message: "Invalid token or token expired" });
    }
};

module.exports = authenticateAdmin;
