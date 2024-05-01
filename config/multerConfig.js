const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + getFileExtension(file.originalname));
    }
});

function getFileExtension(filename) {
    return '.' + filename.split('.').pop(); // Extract file extension from original filename
}

const upload = multer({ storage: storage });

module.exports = upload;
