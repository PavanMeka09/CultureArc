const express = require('express');
const router = express.Router();
const {
    getCollections,
    getCollectionById,
    createCollection,
    updateCollection,
    deleteCollection,
    addArtifactToCollection,
    removeArtifactFromCollection,
    getMyCollections
} = require('../controllers/collectionController');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const {
    collectionSchema,
    collectionUpdateSchema,
    addArtifactToCollectionSchema
} = require('../utils/validation');

router.route('/')
    .get(getCollections)
    .post(protect, validateRequest(collectionSchema), createCollection);

router.route('/my').get(protect, getMyCollections);

router.route('/:id')
    .get(getCollectionById)
    .put(protect, validateRequest(collectionUpdateSchema), updateCollection)
    .delete(protect, deleteCollection);

router.route('/:id/artifacts')
    .post(protect, validateRequest(addArtifactToCollectionSchema), addArtifactToCollection);

router.route('/:id/artifacts/:artifactId')
    .delete(protect, removeArtifactFromCollection);

module.exports = router;
