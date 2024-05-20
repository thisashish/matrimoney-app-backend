const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authMiddleware.js');
const userController = require('../controllers/usersController.js');


router.post('/additional-info/:userId', authenticateUser, userController.enterAdditionalInfo);

router.get('/additional-info/:userId', authenticateUser, userController.getAdditionalInfo);

router.post('/:userId/opposite-gender-users', authenticateUser, userController.getOppositeGenderUsers);

router.post('/block/:userId', authenticateUser, userController.blockUser);

router.post('/unblock/:userId', authenticateUser, userController.unblockUser);

router.post('/find-nearby-people', userController.findNearbyPeople);

module.exports = router;


