const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const postController = require('../controllers/postController');

// Protected routes
router.get('/feed', protect, postController.getFeed); // Get personalized feed
router.post('/:postId/comments', protect, postController.addComment);
router.post('/:postId/vote', protect, postController.vote);

// Public routes
router.get('/', optionalAuth, postController.getAllPosts); // Get all public posts
router.get('/:postId', optionalAuth, postController.getPost); // Get single post

module.exports = router;
