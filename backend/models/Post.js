const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 300
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    images: [{
        type: String  // URLs to the uploaded images
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community',
        required: true
    },
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    downvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    score: {
        type: Number,
        default: 0
    },
    comments: [{
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true,
            trim: true
        },
        upvotes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        downvotes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        score: {
            type: Number,
            default: 0
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    commentCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Add text index for search functionality
postSchema.index({ title: 'text', content: 'text' });

// Method to update score
postSchema.methods.updateScore = function() {
    this.score = this.upvotes.length - this.downvotes.length;
    return this.save();
};

// Method to update comment count
postSchema.methods.updateCommentCount = function() {
    this.commentCount = this.comments.length;
    return this.save();
};

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
