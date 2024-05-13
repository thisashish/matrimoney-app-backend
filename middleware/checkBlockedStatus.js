// middleware/checkBlockedStatus.js
const User = require('../models/User');

const checkBlockedStatus = async (req, res, next) => {
    const userId = req.userData.userId;
    console.log('userId',userId);
    try {
        const user = await User.findOne({ userId: userId });
        if (user.status === 'blocked') {
            return res.status(403).json({ message: 'Your account is blocked. Please contact customer support for assistance.' });
        }
        next();
    } catch (error) {
        console.error('Error checking user status:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = checkBlockedStatus;
