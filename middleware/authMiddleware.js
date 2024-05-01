const jwt = require('jsonwebtoken');

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

module.exports = authenticateUser;
