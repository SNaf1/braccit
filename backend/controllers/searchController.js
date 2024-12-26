const Community = require('../models/Community');
const Post = require('../models/Post');

// Search communities
const searchCommunities = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const communities = await Community.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        })
        .populate('owner', 'username')
        .populate('members', 'username')
        .select('name description members isPrivate createdAt')
        .limit(20);

        res.json(communities);
    } catch (error) {
        console.error('Search communities error:', error);
        res.status(500).json({ error: 'Error searching communities' });
    }
};

// Search posts
const searchPosts = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const posts = await Post.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { content: { $regex: query, $options: 'i' } }
            ]
        })
        .populate('author', 'username')
        .populate('community', 'name')
        .select('title content likes comments createdAt')
        .sort({ createdAt: -1 })
        .limit(20);

        res.json(posts);
    } catch (error) {
        console.error('Search posts error:', error);
        res.status(500).json({ error: 'Error searching posts' });
    }
};

module.exports = {
    searchCommunities,
    searchPosts
};
