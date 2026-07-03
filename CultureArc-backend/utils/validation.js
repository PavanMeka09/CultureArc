const { z } = require('zod');

// User Schemas


const loginSchema = z.object({
    email: z.string()
        .email('Invalid email format')
        .toLowerCase()
        .trim(),
    // Relaxed: only require a non-empty password for login (complexity enforced on signup/reset)
    password: z
        .string()
        .min(1, 'Password is required')
        .max(64, 'Password must not exceed 64 characters')
});

const changePasswordSchema = z.object({
    currentPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(64, "Password must not exceed 64 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[@$!%*?&#]/, "Password must contain at least one special character"),
    newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(64, "Password must not exceed 64 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[@$!%*?&#]/, "Password must contain at least one special character")
});

const forgotPasswordSchema = z.object({
    email: z.string()
        .email('Invalid email format')
        .toLowerCase()
        .trim()
});

const resetPasswordSchema = z.object({
    resetToken: z.string()
        .min(1, 'Reset token is required'),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(64, "Password must not exceed 64 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[@$!%*?&#]/, "Password must contain at least one special character")
});



const adminUpdateUserSchema = z.object({
    name: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be at most 50 characters')
        .trim()
        .optional(),
    email: z.string()
        .email('Invalid email format')
        .toLowerCase()
        .trim()
        .optional(),
    isAdmin: z.boolean().optional()
});

// Signup Flow Schemas
const initiateSignupSchema = z.object({
    name: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be at most 50 characters')
        .trim(),
    email: z.string()
        .email('Invalid email format')
        .toLowerCase()
        .trim()
});

const verifyOtpSchema = z.object({
    email: z.string()
        .email('Invalid email format')
        .toLowerCase()
        .trim(),
    otp: z.string()
        .length(6, 'OTP must be 6 digits')
        .regex(/^\d+$/, 'OTP must contain only numbers')
});

const completeSignupSchema = z.object({
    signupToken: z.string()
        .min(1, 'Signup token is required'),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(64, "Password must not exceed 64 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[@$!%*?&#]/, "Password must contain at least one special character")
});

// Artifact Schemas
const artifactSchema = z.object({
    title: z.string()
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title must be at most 200 characters')
        .trim(),
    description: z.string()
        .min(10, 'Description must be at least 10 characters')
        .max(5000, 'Description must be at most 5000 characters')
        .trim(),
    imageUrl: z.string()
        .url('Invalid image URL'),
    category: z.string()
        .min(1, 'Category is required')
        .trim(),
    era: z.string()
        .min(1, 'Era is required')
        .trim(),
    region: z.string()
        .min(1, 'Region is required')
        .trim()
});

const artifactUpdateSchema = artifactSchema.partial();

const artifactStatusSchema = z.object({
    status: z.enum(['pending', 'approved', 'rejected'], {
        errorMap: () => ({ message: 'Status must be pending, approved, or rejected' })
    }),
    reason: z.string()
        .max(500, 'Reason must be at most 500 characters')
        .optional()
});

// Comment Schema
const commentSchema = z.object({
    text: z.string()
        .min(1, 'Comment cannot be empty')
        .max(1000, 'Comment must be at most 1000 characters')
        .trim()
});

// Collection Schemas
const collectionSchema = z.object({
    title: z.string()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title must be at most 100 characters')
        .trim(),
    description: z.string()
        .min(5, 'Description must be at least 5 characters')
        .max(1000, 'Description must be at most 1000 characters')
        .trim(),
    imageUrl: z.string()
        .url('Invalid image URL')
        .optional(),
    isPrivate: z.boolean().optional()
});

const collectionUpdateSchema = collectionSchema.partial();

const addArtifactToCollectionSchema = z.object({
    artifactId: z.string()
        .min(1, 'Artifact ID is required')
});

// Resend verification schema


module.exports = {
    // User schemas
    loginSchema,
    changePasswordSchema,
    forgotPasswordSchema,
    resetPasswordSchema,

    adminUpdateUserSchema,
    // Artifact schemas
    artifactSchema,
    artifactUpdateSchema,
    artifactStatusSchema,
    commentSchema,
    // Collection schemas
    collectionSchema,
    collectionUpdateSchema,
    addArtifactToCollectionSchema,
    // New Signup Schemas
    initiateSignupSchema,
    verifyOtpSchema,
    completeSignupSchema
};

