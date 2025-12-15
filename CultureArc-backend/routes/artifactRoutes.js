const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/artifactController');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const {
    artifactSchema,
    artifactUpdateSchema,
    artifactStatusSchema,
    commentSchema
} = require('../utils/validation');

router.route('/')
    .get(getArtifacts)
    .post(protect, validateRequest(artifactSchema), createArtifact);

router.route('/pending-count').get(protect, admin, getPendingCount);
router.route('/pending').get(protect, admin, getPendingArtifacts);

router.route('/:id')
    .get(getArtifactById)
    .put(protect, validateRequest(artifactUpdateSchema), updateArtifact)
    .delete(protect, deleteArtifact);

router.route('/:id/status')
    .put(protect, admin, validateRequest(artifactStatusSchema), updateArtifactStatus);

router.route('/:id/like').post(protect, likeArtifact);

router.route('/:id/comment')
    .post(protect, validateRequest(commentSchema), createComment);

router.route('/:id/comment/:commentId')
    .put(protect, validateRequest(commentSchema), updateComment)
    .delete(protect, deleteComment);

module.exports = router;
