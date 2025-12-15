const express = require('express');
const router = express.Router();
const {
    authUser,
    // registerUser, // Deprecated
    getUserProfile,
    updateUserProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    getLikedArtifacts,
    getUsers,
    deleteUser,
    updateUser,
    // New signup flows
    initiateSignup,
    verifySignupOtp,
    completeSignup
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const {
    // registerSchema,
    loginSchema,
    changePasswordSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    profileUpdateSchema,
    adminUpdateUserSchema,
    resendVerificationSchema,
    // New schemas
    initiateSignupSchema,
    verifyOtpSchema,
    completeSignupSchema
} = require('../utils/validation');

// Public routes
// router.post('/', validateRequest(registerSchema), registerUser); // Deprecated
router.post('/initiate-signup', validateRequest(initiateSignupSchema), initiateSignup);
router.post('/verify-signup-otp', validateRequest(verifyOtpSchema), verifySignupOtp);
router.post('/complete-signup', validateRequest(completeSignupSchema), completeSignup);

router.post('/login', validateRequest(loginSchema), authUser);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', validateRequest(resetPasswordSchema), resetPassword);
router.get('/verify/:token', verifyEmail); // Keep just in case for old links? Or maybe remove if totally replacing system.
// Verify token links from old system might still be floating around, but we can't easily support them if we remove the logic. 
// Actually verifyEmail controller logic is still there. 
router.post('/resend-verification', validateRequest(resendVerificationSchema), resendVerification);

// Protected routes
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, validateRequest(profileUpdateSchema), updateUserProfile);
router.put('/password', protect, validateRequest(changePasswordSchema), changePassword);
router.get('/liked', protect, getLikedArtifacts);

// Admin routes
router.route('/').get(protect, admin, getUsers);
router.route('/:id')
    .put(protect, admin, validateRequest(adminUpdateUserSchema), updateUser)
    .delete(protect, admin, deleteUser);

module.exports = router;
