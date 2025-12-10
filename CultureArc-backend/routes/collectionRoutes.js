const express = require('express');
const router = express.Router();
const {
    getCollections,
    getCollectionById,
    createCollection,
    addArtifactToCollection,
    getMyCollections
} = require('../controllers/collectionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getCollections).post(protect, createCollection);
router.route('/my').get(protect, getMyCollections);
router.route('/:id').get(getCollectionById);
router.route('/:id/artifacts').post(protect, addArtifactToCollection);

module.exports = router;
