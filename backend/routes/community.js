const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const communityController = require('../controllers/communityController');
const postController = require('../controllers/postController');

// Community routes
router.post('/', protect, upload.single('bannerImage'), communityController.createCommunity);
router.get('/', protect, communityController.getAllCommunities);
router.get('/user', protect, communityController.getUserCommunities);
router.get('/search', protect, communityController.searchCommunities);
router.get('/:name', protect, communityController.getCommunity);
router.post('/:name/join', protect, communityController.requestJoin);
router.post('/:name/approve', protect, communityController.approveJoinRequest);
router.post('/:name/reject', protect, communityController.rejectJoinRequest);
router.post('/:name/cancel-join', protect, communityController.cancelJoinRequest);
router.post('/:name/leave', protect, communityController.leaveCommunity);
router.post('/:name/remove-member', protect, communityController.removeMember);
router.post('/:name/admin', protect, communityController.addAdmin);
router.put('/:name', protect, upload.single('bannerImage'), communityController.updateCommunity);

// Post routes within community
router.post('/:communityName/posts', protect, upload.array('images', 5), postController.createPost);
router.get('/:communityName/posts', protect, postController.getCommunityPosts);

module.exports = router;
