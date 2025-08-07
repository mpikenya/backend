// routes/newsRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer');
const protectAdmin = require('../middlewares/verifyAdmin.js'); // Your auth middleware
const { createPost, getAllPosts, getPostById,deletePost } = require('../controllers/newsController');

// Admin route to create a post
router.post('/admin/news', protectAdmin, upload.single('image'), createPost);

// Public route to get all posts
router.get('/news', getAllPosts);

// Public route to get a single post by its ID
router.get('/news/:id', getPostById);

router.delete('/admin/news/:id', protectAdmin, deletePost);

module.exports = router;