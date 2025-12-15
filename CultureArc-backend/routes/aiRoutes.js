const express = require('express');
const router = express.Router();
const { analyzeArtifact } = require('../controllers/aiController');
// const { protect } = require('../middleware/authMiddleware'); // Uncomment if auth is required

router.post('/analyze', analyzeArtifact);

module.exports = router;
