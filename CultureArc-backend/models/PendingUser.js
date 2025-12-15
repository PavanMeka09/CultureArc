const mongoose = require('mongoose');

const pendingUserSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        otp: {
            type: String, // Storing hashed OTP is better practice, but for simplicity we might just store it or hash it. Let's start with plain, but better hash it. Actually controller will handle hashing if needed.
            required: true,
        },
        otpExpires: {
            type: Date,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

// Expire documents after 15 minutes automatically
pendingUserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 900 });

const PendingUser = mongoose.model('PendingUser', pendingUserSchema);

module.exports = PendingUser;
