const asyncHandler = require('express-async-handler');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
const Artifact = require('../models/Artifact');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken'); // Added jwt require
const { sendVerificationEmail, sendPasswordResetEmail, sendOtpEmail } = require('../utils/sendEmail');

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,

            avatar: user.avatar || '',
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Initiate signup flow (Step 1)
// @route   POST /api/users/initiate-signup
// @access  Public
const initiateSignup = asyncHandler(async (req, res) => {
    const { name, email } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User with this email already exists');
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Check for existing pending user and update, or create new
    let pendingUser = await PendingUser.findOne({ email });

    if (pendingUser) {
        pendingUser.name = name;
        pendingUser.otp = otp;
        pendingUser.otpExpires = otpExpires;
        await pendingUser.save();
    } else {
        pendingUser = await PendingUser.create({
            name,
            email,
            otp,
            otpExpires
        });
    }

    // Send OTP email
    await sendOtpEmail(email, otp);

    res.status(200).json({
        message: 'OTP sent to your email',
        email
    });
});

// @desc    Verify signup OTP (Step 2)
// @route   POST /api/users/verify-signup-otp
// @access  Public
const verifySignupOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const pendingUser = await PendingUser.findOne({
        email,
        otp,
        otpExpires: { $gt: Date.now() }
    });

    if (!pendingUser) {
        res.status(400);
        throw new Error('Invalid or expired OTP');
    }

    // Generate specific signup token
    const signupToken = jwt.sign(
        { email, pendingId: pendingUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '30m' }
    );

    res.status(200).json({
        message: 'OTP verified successfully',
        signupToken
    });
});

// @desc    Complete signup (Step 3)
// @route   POST /api/users/complete-signup
// @access  Public
const completeSignup = asyncHandler(async (req, res) => {
    const { signupToken, password } = req.body;

    let decoded;
    try {
        decoded = jwt.verify(signupToken, process.env.JWT_SECRET);
    } catch (error) {
        res.status(401);
        throw new Error('Invalid or expired signup token');
    }

    const { email, pendingId } = decoded;

    // Verify pending user still exists (security check)
    const pendingUser = await PendingUser.findById(pendingId);
    if (!pendingUser) {
        res.status(400);
        throw new Error('Invalid signup session. Please start over.');
    }

    // Double check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const user = await User.create({
        name: pendingUser.name,
        email: pendingUser.email,
        password: hashedPassword,
        isVerified: true // They verified email via OTP
    });

    if (user) {
        // Remove pending user record
        await pendingUser.deleteOne();

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            avatar: user.avatar || '',
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});


// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,

            avatar: user.avatar || '',
            isVerified: user.isVerified,
            createdAt: user.createdAt,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.avatar = req.body.avatar !== undefined ? req.body.avatar : user.avatar;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            avatar: updatedUser.avatar,
            isVerified: updatedUser.isVerified,
            createdAt: updatedUser.createdAt,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Change password
// @route   PUT /api/users/password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        res.status(400);
        throw new Error('Current password is incorrect');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
});

// @desc    Forgot password - generate reset token
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send password reset email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user, resetUrl);

    res.json({
        message: 'Password reset email sent. Please check your inbox.'
    });
});

// @desc    Reset password with token
// @route   POST /api/users/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
});

// @desc    Verify email
// @route   GET /api/users/verify/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
        res.status(400);
        throw new Error('Invalid verification token');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
});

// @desc    Resend verification email
// @route   POST /api/users/resend-verification
// @access  Public
const resendVerification = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.isVerified) {
        res.status(400);
        throw new Error('Email is already verified');
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;
    await sendVerificationEmail(user, verificationUrl);

    res.json({ message: 'Verification email sent. Please check your inbox.' });
});

// @desc    Get artifacts liked by user
// @route   GET /api/users/liked
// @access  Private
const getLikedArtifacts = asyncHandler(async (req, res) => {
    const artifacts = await Artifact.find({ likes: req.user._id });
    res.json(artifacts);
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user by admin
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.isAdmin = req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    authUser,
    authUser,
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
    deleteUser,
    updateUser,
    // New signup flows
    initiateSignup,
    verifySignupOtp,
    completeSignup
};
