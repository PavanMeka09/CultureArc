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

// All routes require authentication
router.use(protect);

router.route('/')
    .get(getCollections)
    .post(validateRequest(collectionSchema), createCollection);

router.route('/my').get(getMyCollections);

router.route('/:id')
    .get(getCollectionById)
    .put(validateRequest(collectionUpdateSchema), updateCollection)
    .delete(deleteCollection);

router.route('/:id/artifacts')
    .post(validateRequest(addArtifactToCollectionSchema), addArtifactToCollection);

router.route('/:id/artifacts/:artifactId')
    .delete(removeArtifactFromCollection);

module.exports = router;
