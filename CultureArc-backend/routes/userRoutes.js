const express = require('express');
const router = express.Router();
const {
    authUser,
    // registerUser, // Deprecated
    getUserProfile,

    changePassword,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    initiateSignup,
    verifySignupOtp,
    completeSignup,
    getLikedArtifacts,
    getUsers,
    deleteUser,
    updateUser
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const {
    // registerSchema,
    loginSchema,
    changePasswordSchema,
    forgotPasswordSchema,
    resetPasswordSchema,

    adminUpdateUserSchema,
    // New schemas
    initiateSignupSchema,
    verifyOtpSchema,
    completeSignupSchema
} = require('../utils/validation');

// Public routes
router.post('/login', validateRequest(loginSchema), authUser);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/verify-reset-otp', validateRequest(verifyOtpSchema), verifyResetOtp);
router.post('/reset-password', validateRequest(resetPasswordSchema), resetPassword);
// New Signup Flow
router.post('/initiate-signup', validateRequest(initiateSignupSchema), initiateSignup);
router.post('/verify-signup-otp', validateRequest(verifyOtpSchema), verifySignupOtp);
router.post('/complete-signup', validateRequest(completeSignupSchema), completeSignup);

// Protected routes
router.route('/profile')
    .get(protect, getUserProfile)
router.put('/password', protect, validateRequest(changePasswordSchema), changePassword);
router.get('/liked', protect, getLikedArtifacts);

// Admin routes
router.route('/').get(protect, admin, getUsers);
router.route('/:id')
    .put(protect, admin, validateRequest(adminUpdateUserSchema), updateUser)
    .delete(protect, admin, deleteUser);

module.exports = router;
