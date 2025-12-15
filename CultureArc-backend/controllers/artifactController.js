const asyncHandler = require('express-async-handler');
const Artifact = require('../models/Artifact');
const { reviewArtifactContent, determineStatus } = require('../utils/aiReview');

// @desc    Fetch all artifacts with optional filters
// @route   GET /api/artifacts
// @access  Public
const getArtifacts = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.limit) || 12;
    const page = Number(req.query.page) || 1;

    const keyword = req.query.keyword ? {
        $or: [
            { title: { $regex: req.query.keyword, $options: 'i' } },
            { description: { $regex: req.query.keyword, $options: 'i' } },
            { era: { $regex: req.query.keyword, $options: 'i' } },
            { region: { $regex: req.query.keyword, $options: 'i' } }
        ]
    } : {};

    const category = req.query.category ? {
        category: { $regex: req.query.category, $options: 'i' }
    } : {};

    // Status filter - default to approved for public, allow 'all' or specific status for admin
    let statusFilter = {};
    if (req.query.status === 'all') {
        // Admin viewing all
        statusFilter = {};
    } else if (req.query.status) {
        statusFilter = { status: req.query.status };
    } else {
        // Default: only show approved artifacts for public
        statusFilter = { status: 'approved' };
    }

    const count = await Artifact.countDocuments({ ...keyword, ...category, ...statusFilter });
    const artifacts = await Artifact.find({ ...keyword, ...category, ...statusFilter })
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({ artifacts, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Get pending artifacts count
// @route   GET /api/artifacts/pending-count
// @access  Private/Admin
const getPendingCount = asyncHandler(async (req, res) => {
    const count = await Artifact.countDocuments({ status: 'pending' });
    res.json({ count });
});

// @desc    Get pending artifacts for review
// @route   GET /api/artifacts/pending
// @access  Private/Admin
const getPendingArtifacts = asyncHandler(async (req, res) => {
    const artifacts = await Artifact.find({ status: 'pending' })
        .sort({ createdAt: -1 })
        .populate('user', 'name email');
    res.json(artifacts);
});

// @desc    Fetch single artifact
// @route   GET /api/artifacts/:id
// @access  Public
const getArtifactById = asyncHandler(async (req, res) => {
    const artifact = await Artifact.findById(req.params.id);

    if (artifact) {
        res.json(artifact);
    } else {
        res.status(404);
        throw new Error('Artifact not found');
    }
});

// @desc    Create an artifact with AI review
// @route   POST /api/artifacts
// @access  Private
const createArtifact = asyncHandler(async (req, res) => {
    const { title, description, imageUrl, category, era, region } = req.body;

    // Create artifact data
    const artifactData = {
        title,
        description,
        imageUrl,
        category,
        era,
        region,
        user: req.user._id,
        status: 'pending'
    };

    // Perform AI review if API key is configured
    if (process.env.GOOGLE_API_KEY) {
        try {
            const aiReview = await reviewArtifactContent(artifactData);
            artifactData.aiReview = aiReview;
            artifactData.status = determineStatus(aiReview);
        } catch (error) {
            console.error('AI Review failed:', error);
            // Continue with pending status if AI review fails
            artifactData.status = 'pending';
        }
    } else {
        // No AI key configured - auto-approve for development
        artifactData.status = 'approved';
    }

    const artifact = new Artifact(artifactData);
    const createdArtifact = await artifact.save();
    res.status(201).json(createdArtifact);
});

// @desc    Update artifact status (Admin approval/rejection)
// @route   PUT /api/artifacts/:id/status
// @access  Private/Admin
const updateArtifactStatus = asyncHandler(async (req, res) => {
    const { status, reason } = req.body;
    const artifact = await Artifact.findById(req.params.id);

    if (!artifact) {
        res.status(404);
        throw new Error('Artifact not found');
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
        res.status(400);
        throw new Error('Invalid status');
    }

    artifact.status = status;
    if (reason) {
        artifact.aiReview = {
            ...artifact.aiReview,
            reason: reason,
            reviewedAt: new Date()
        };
    }

    const updatedArtifact = await artifact.save();
    res.json(updatedArtifact);
});

// @desc    Update an artifact
// @route   PUT /api/artifacts/:id
// @access  Private
const updateArtifact = asyncHandler(async (req, res) => {
    const { title, description, imageUrl, category, era, region } = req.body;
    const artifact = await Artifact.findById(req.params.id);

    if (artifact) {
        if (artifact.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            res.status(401);
            throw new Error('Not authorized to update this artifact');
        }

        artifact.title = title || artifact.title;
        artifact.description = description || artifact.description;
        artifact.imageUrl = imageUrl || artifact.imageUrl;
        artifact.category = category || artifact.category;
        artifact.era = era || artifact.era;
        artifact.region = region || artifact.region;

        const updatedArtifact = await artifact.save();
        res.json(updatedArtifact);
    } else {
        res.status(404);
        throw new Error('Artifact not found');
    }
});

// @desc    Delete an artifact
// @route   DELETE /api/artifacts/:id
// @access  Private
const deleteArtifact = asyncHandler(async (req, res) => {
    const artifact = await Artifact.findById(req.params.id);

    if (artifact) {
        if (artifact.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            res.status(401);
            throw new Error('Not authorized to delete this artifact');
        }

        await artifact.deleteOne();
        res.json({ message: 'Artifact removed' });
    } else {
        res.status(404);
        throw new Error('Artifact not found');
    }
});

// @desc    Like/Unlike an artifact
// @route   POST /api/artifacts/:id/like
// @access  Private
const likeArtifact = asyncHandler(async (req, res) => {
    const artifact = await Artifact.findById(req.params.id);
    if (!artifact) {
        res.status(404);
        throw new Error('Artifact not found');
    }

    if (!artifact.likes) {
        artifact.likes = [];
    }

    if (artifact.likes.includes(req.user._id)) {
        artifact.likes = artifact.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
        artifact.likes.push(req.user._id);
    }
    await artifact.save();
    res.json(artifact.likes);
});

// @desc    Add a comment
// @route   POST /api/artifacts/:id/comment
// @access  Private
const createComment = asyncHandler(async (req, res) => {
    const { text } = req.body;
    const artifact = await Artifact.findById(req.params.id);

    if (!artifact) {
        res.status(404);
        throw new Error('Artifact not found');
    }

    const comment = {
        user: req.user._id,
        userName: req.user.name,
        text,
    };

    if (!artifact.comments) {
        artifact.comments = [];
    }

    artifact.comments.push(comment);
    await artifact.save();
    res.status(201).json(artifact.comments);
});

// @desc    Update a comment
// @route   PUT /api/artifacts/:id/comment/:commentId
// @access  Private
const updateComment = asyncHandler(async (req, res) => {
    const { text } = req.body;
    const artifact = await Artifact.findById(req.params.id);

    if (!artifact) {
        res.status(404);
        throw new Error('Artifact not found');
    }

    const comment = artifact.comments.id(req.params.commentId);
    if (!comment) {
        res.status(404);
        throw new Error('Comment not found');
    }

    // Check if user owns the comment
    if (comment.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        res.status(401);
        throw new Error('Not authorized to edit this comment');
    }

    comment.text = text;
    await artifact.save();
    res.json(artifact.comments);
});

// @desc    Delete a comment
// @route   DELETE /api/artifacts/:id/comment/:commentId
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
    const artifact = await Artifact.findById(req.params.id);

    if (!artifact) {
        res.status(404);
        throw new Error('Artifact not found');
    }

    const comment = artifact.comments.id(req.params.commentId);
    if (!comment) {
        res.status(404);
        throw new Error('Comment not found');
    }

    // Check if user owns the comment or is admin
    if (comment.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        res.status(401);
        throw new Error('Not authorized to delete this comment');
    }

    comment.deleteOne();
    await artifact.save();
    res.json({ message: 'Comment removed' });
});

module.exports = {
    getArtifacts,
    getPendingCount,
    getPendingArtifacts,
    getArtifactById,
    createArtifact,
    updateArtifactStatus,
    updateArtifact,
    deleteArtifact,
    likeArtifact,
    createComment,
    updateComment,
    deleteComment
};
