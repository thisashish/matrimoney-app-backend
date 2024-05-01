const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig');
const photoController = require('../controllers/photoController');

router.post('/users/:_id/photos', upload.array('photos'), photoController.uploadPhotos);

module.exports = router;
