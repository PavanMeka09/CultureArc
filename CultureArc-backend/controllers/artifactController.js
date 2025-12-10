const asyncHandler = require('express-async-handler');
const Artifact = require('../models/Artifact');

// @desc    Fetch all artifacts
// @route   GET /api/artifacts
// @access  Public
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

    const count = await Artifact.countDocuments({ ...keyword, ...category });
    const artifacts = await Artifact.find({ ...keyword, ...category })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({ artifacts, page, pages: Math.ceil(count / pageSize) });
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

// @desc    Create an artifact
// @route   POST /api/artifacts
// @access  Private (To be implemented)
const createArtifact = asyncHandler(async (req, res) => {
    const { title, description, imageUrl, category, era, region } = req.body;

    const artifact = new Artifact({
        title,
        description,
        imageUrl,
        category,
        era,
        region,
        user: req.user._id
    });

    const createdArtifact = await artifact.save();
    res.status(201).json(createdArtifact);
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

module.exports = {
    getArtifacts,
    getArtifactById,
    createArtifact,
    updateArtifact,
    deleteArtifact,
    likeArtifact,
    createComment
};
