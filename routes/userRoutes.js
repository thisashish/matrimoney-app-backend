const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authMiddleware.js');
const userController = require('../controllers/usersController.js');


router.post('/:userId/additional-info',authenticateUser, userController.enterAdditionalInfo);

router.get('/:userId/additional-info', authenticateUser, userController.getAdditionalInfo);

router.get('/:userId/opposite-gender-users',authenticateUser, userController.getOppositeGenderUsers);


module.exports = router;

