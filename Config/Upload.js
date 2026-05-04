const multer = require('multer');
const path = require('path');
const appRoot = require('app-root-path')

// Cấu hình nơi lưu ảnh
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, appRoot + '/public/uploads/'); // Lưu ảnh vào thư mục public/uploads
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Tên file là timestamp + đuôi file
    }
});

// Chỉ chấp nhận file ảnh
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh!'), false);
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
