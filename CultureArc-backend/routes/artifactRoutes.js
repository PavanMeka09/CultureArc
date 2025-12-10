const express = require('express');
const router = express.Router();
const {
    getArtifacts,
    getArtifactById,
    createArtifact,
    updateArtifact,
    deleteArtifact,
    likeArtifact,
    createComment
} = require('../controllers/artifactController');

const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getArtifacts).post(protect, createArtifact);
router.route('/:id').get(getArtifactById).put(protect, updateArtifact).delete(protect, deleteArtifact);
router.route('/:id/like').post(protect, likeArtifact);
router.route('/:id/comment').post(protect, createComment);

module.exports = router;
