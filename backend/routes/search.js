const express = require('express');
const router = express.Router();
const { searchCommunities } = require('../controllers/communityController');
const { searchPosts } = require('../controllers/postController');

// Search routes
router.get('/communities', searchCommunities);
router.get('/posts', searchPosts);

module.exports = router;
