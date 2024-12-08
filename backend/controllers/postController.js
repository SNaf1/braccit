const Post = require('../models/Post');
const Community = require('../models/Community');

// Create a new post
const createPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        const communityName = req.params.communityName.toLowerCase();
        const images = req.files ? req.files.map(file => file.path) : [];

        // Find community
        const community = await Community.findOne({ name: communityName });
        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        // Check if user is member of private community
        if (community.isPrivate && !community.members.includes(req.user._id)) {
            return res.status(403).json({ error: 'Must be a member to post' });
        }

        const post = new Post({
            title,
            content,
            author: req.user._id,
            community: community._id,
            images
        });

        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ error: 'Error creating post' });
    }
};

// Get all posts for a community
const getCommunityPosts = async (req, res) => {
    try {
        const communityName = req.params.communityName.toLowerCase();

        // Find community
        const community = await Community.findOne({ name: communityName });
        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        // Check if user has access to private community
        if (community.isPrivate && !community.members.includes(req.user._id)) {
            return res.status(403).json({ error: 'Must be a member to view posts' });
        }

        const posts = await Post.find({ community: community._id })
            .populate('author', 'username')
            .populate('community', 'name')
            .sort({ createdAt: -1 });

        // Add vote information to each post
        const postsWithVotes = posts.map(post => {
            const postObj = post.toObject();
            const voteScore = postObj.upvotes.length - postObj.downvotes.length;
            
            return {
                ...postObj,
                voteScore,
                userVote: req.user ? 
                    (postObj.upvotes.some(id => id.equals(req.user._id)) ? 'up' :
                     postObj.downvotes.some(id => id.equals(req.user._id)) ? 'down' : 
                     null) : null
            };
        });

        res.json(postsWithVotes);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching posts' });
    }
};

// Get single post with comments
const getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId)
            .populate('author', 'username')
            .populate('community', 'name isPrivate')
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'username'
                }
            });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if community is private and user has access
        if (post.community.isPrivate) {
            // For private communities, check if user is authenticated and is a member
            if (!req.user) {
                return res.status(403).json({ error: 'Must be logged in to view private community posts' });
            }
            
            // Get full community details to check membership
            const community = await Community.findById(post.community._id);
            if (!community.members.includes(req.user._id)) {
                return res.status(403).json({ error: 'Must be a member to view post' });
            }
        }

        // Add user's vote status if user is authenticated
        const postObj = post.toObject();
        const userId = req.user?._id;
        
        let userVote = null;
        if (userId) {
            if (postObj.upvotes.some(id => id.equals(userId))) {
                userVote = 'up';
            } else if (postObj.downvotes.some(id => id.equals(userId))) {
                userVote = 'down';
            }
        }

        res.json({
            ...postObj,
            userVote,
            voteScore: postObj.upvotes.length - postObj.downvotes.length
        });
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: 'Error fetching post' });
    }
};

// Add comment to post
const addComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if user has access to private community
        const community = await Community.findById(post.community);
        if (community.isPrivate && !community.members.includes(req.user._id)) {
            return res.status(403).json({ error: 'Must be a member to comment' });
        }

        const { content } = req.body;
        const comment = {
            content,
            author: req.user._id,
            createdAt: new Date()
        };

        post.comments.push(comment);
        await post.save();

        // Populate author info before sending response
        const populatedComment = await Post.findById(post._id)
            .populate('comments.author', 'username')
            .then(p => p.comments[p.comments.length - 1]);

        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(500).json({ error: 'Error adding comment' });
    }
};

// Vote on post
const vote = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if user has access to private community
        const community = await Community.findById(post.community);
        if (community.isPrivate && !community.members.includes(req.user._id)) {
            return res.status(403).json({ error: 'Must be a member to vote' });
        }

        const { voteType } = req.body; // 'up' or 'down' or null
        const userId = req.user._id;

        // Remove existing vote if any
        post.upvotes = post.upvotes.filter(id => !id.equals(userId));
        post.downvotes = post.downvotes.filter(id => !id.equals(userId));

        // Add new vote if not removing
        if (voteType === 'up') {
            post.upvotes.push(userId);
        } else if (voteType === 'down') {
            post.downvotes.push(userId);
        }

        await post.save();

        // Calculate current user's vote
        let userVote = null;
        if (post.upvotes.some(id => id.equals(userId))) {
            userVote = 'up';
        } else if (post.downvotes.some(id => id.equals(userId))) {
            userVote = 'down';
        }

        res.json({
            upvotes: post.upvotes,
            downvotes: post.downvotes,
            userVote: userVote,
            voteScore: post.upvotes.length - post.downvotes.length,
            _id: post._id
        });
    } catch (error) {
        res.status(500).json({ error: 'Error voting on post' });
    }
};

// Get feed (posts from all communities user is member of)
const getFeed = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get all communities user is member of
        const communities = await Community.find({
            members: req.user._id
        });

        // If user is not a member of any communities, return empty array
        if (!communities || communities.length === 0) {
            return res.json([]);
        }

        const communityIds = communities.map(c => c._id);

        // Get posts from these communities
        const posts = await Post.find({
            community: { $in: communityIds }
        })
            .populate('author', 'username')
            .populate('community', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Add user's vote status and vote score to each post
        const postsWithVotes = posts.map(post => {
            const postObj = post.toObject();
            const userId = req.user?._id;
            
            let userVote = null;
            if (userId) {
                if (postObj.upvotes.some(id => id.equals(userId))) {
                    userVote = 'up';
                } else if (postObj.downvotes.some(id => id.equals(userId))) {
                    userVote = 'down';
                }
            }

            return {
                ...postObj,
                userVote,
                voteScore: postObj.upvotes.length - postObj.downvotes.length
            };
        });

        res.json(postsWithVotes);
    } catch (error) {
        console.error('Feed error:', error);
        res.status(500).json({ error: 'Error fetching feed' });
    }
};

// Get all public posts
const getAllPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get posts from public communities
        const posts = await Post.find({
            community: {
                $in: await Community.find({ isPrivate: false }).distinct('_id')
            }
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'username')
            .populate('community', 'name');

        // Add vote information to each post
        const postsWithVotes = posts.map(post => {
            const postObj = post.toObject();
            const voteScore = postObj.upvotes.length - postObj.downvotes.length;
            
            return {
                ...postObj,
                voteScore,
                userVote: req.user ? 
                    (postObj.upvotes.some(id => id.equals(req.user._id)) ? 'up' :
                     postObj.downvotes.some(id => id.equals(req.user._id)) ? 'down' : 
                     null) : null
            };
        });

        res.json(postsWithVotes);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Error fetching posts' });
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
                { content: { $regex: query, $options: 'i' } },
                { tags: { $regex: query, $options: 'i' } }
            ]
        })
        .populate('author', 'username profilePicture')
        .populate('community', 'name')
        .select('title content tags likes comments createdAt')
        .sort({ createdAt: -1 })
        .limit(20);

        res.json(posts);
    } catch (error) {
        console.error('Search posts error:', error);
        res.status(500).json({ error: 'Error searching posts' });
    }
};

module.exports = {
    createPost,
    getCommunityPosts,
    getPost,
    addComment,
    vote,
    getFeed,
    getAllPosts,
    searchPosts
};
