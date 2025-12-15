const mongoose = require('mongoose');

const artifactSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        imageUrl: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        era: {
            type: String,
            required: true,
        },
        region: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        aiReview: {
            isAppropriate: { type: Boolean },
            confidence: { type: Number },
            reason: { type: String },
            reviewedAt: { type: Date },
        },
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        comments: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            userName: { type: String, required: true },
            text: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }],
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

const Artifact = mongoose.model('Artifact', artifactSchema);

module.exports = Artifact;
