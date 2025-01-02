const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxLength: 500,
    },
    bannerImage: {
      type: String, // URL to the banner image
      default: "",
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    memberCount: {
      type: Number,
      default: 0
    },
    pendingMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Add text index for search functionality
communitySchema.index({ name: "text", description: "text" });

// Middleware to update memberCount when members array changes
communitySchema.pre('save', function(next) {
  if (this.isModified('members')) {
    this.memberCount = this.members.length;
  }
  next();
});

const Community = mongoose.model("Community", communitySchema);

module.exports = Community;
