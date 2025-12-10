const asyncHandler = require('express-async-handler');
const Collection = require('../models/Collection');

// @desc    Fetch all collections
// @route   GET /api/collections
// @access  Public
const getCollections = asyncHandler(async (req, res) => {
    const collections = await Collection.find({});
    res.json(collections);
});

// @desc    Fetch single collection
// @route   GET /api/collections/:id
// @access  Public
const getCollectionById = asyncHandler(async (req, res) => {
    const collection = await Collection.findById(req.params.id);

    if (collection) {
        res.json(collection);
    } else {
        res.status(404);
        throw new Error('Collection not found');
    }
});


// @desc    Create a new collection
// @route   POST /api/collections
// @access  Private
const createCollection = asyncHandler(async (req, res) => {
    const { title, description, imageUrl, isPrivate } = req.body;

    const collection = new Collection({
        title,
        description,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=2674&auto=format&fit=crop', // Default image
        user: req.user._id,
        artifacts: [],
        isPrivate: isPrivate || false
    });

    const createdCollection = await collection.save();
    res.status(201).json(createdCollection);
});

// @desc    Add artifact to collection
// @route   POST /api/collections/:id/artifacts
// @access  Private
const addArtifactToCollection = asyncHandler(async (req, res) => {
    const { artifactId } = req.body;
    const collection = await Collection.findById(req.params.id);

    if (collection) {
        // Check ownership
        if (collection.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to update this collection');
        }

        // Check if artifact already exists
        if (collection.artifacts.includes(artifactId)) {
            res.status(400);
            throw new Error('Artifact already in collection');
        }

        collection.artifacts.push(artifactId);
        const updatedCollection = await collection.save();
        res.json(updatedCollection);
    } else {
        res.status(404);
        throw new Error('Collection not found');
    }
});

// @desc    Get logged in user's collections
// @route   GET /api/collections/my
// @access  Private
const getMyCollections = asyncHandler(async (req, res) => {
    const collections = await Collection.find({ user: req.user._id });
    res.json(collections);
});

module.exports = {
    getCollections,
    getCollectionById,
    createCollection,
    addArtifactToCollection,
    getMyCollections
};
