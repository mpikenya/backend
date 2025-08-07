const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer');
const { uploadImage, getAllImages,deleteImage } = require('../controllers/galleryController');
// CORRECT - This imports the entire function into the 'protectAdmin' variable
const protectAdmin = require('../middlewares/verifyAdmin.js');// Assuming you have this

// Admin route to upload an image. `upload.single('image')` must match the FormData key.
router.post('/admin/gallery', protectAdmin, upload.array('images', 10), uploadImage);

// Public route to get all images
router.get('/gallery', getAllImages);
router.delete('/admin/gallery/:id', protectAdmin, deleteImage);

module.exports = router;