const nodemailer = require('nodemailer');

// Create transporter based on environment configuration
const createTransporter = () => {
    // For Gmail
    if (process.env.EMAIL_SERVICE === 'gmail') {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS // Use App Password for Gmail
            }
        });
    }

    // For custom SMTP
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} options.html - HTML body (optional)
 */
const sendEmail = async ({ to, subject, text, html }) => {
    try {
        // Check if email is configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('Email not configured. Would have sent:');
            console.log({ to, subject, text });
            return { success: true, message: 'Email logging only (not configured)' };
        }

        const transporter = createTransporter();

        const mailOptions = {
            from: `"CultureArc" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html: html || text
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send verification email to new user
 */
const sendVerificationEmail = async (user, verificationUrl) => {
    const subject = 'Verify your CultureArc account';
    const text = `Welcome to CultureArc!\n\nPlease verify your email by clicking the link below:\n${verificationUrl}\n\nThis link expires in 24 hours.`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8B5CF6;">Welcome to CultureArc!</h1>
            <p>Thank you for joining our cultural heritage preservation platform.</p>
            <p>Please verify your email by clicking the button below:</p>
            <a href="${verificationUrl}" style="display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">Verify Email</a>
            <p style="color: #666; font-size: 12px;">This link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>
        </div>
    `;

    return sendEmail({ to: user.email, subject, text, html });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (user, resetUrl) => {
    const subject = 'Reset your CultureArc password';
    const text = `You requested a password reset.\n\nClick the link below to reset your password:\n${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, you can ignore this email.`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8B5CF6;">Password Reset Request</h1>
            <p>You requested to reset your password for your CultureArc account.</p>
            <p>Click the button below to set a new password:</p>
            <a href="${resetUrl}" style="display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">Reset Password</a>
            <p style="color: #666; font-size: 12px;">This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
    `;

    return sendEmail({ to: user.email, subject, text, html });
};

module.exports = {
    sendEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendOtpEmail: async (email, otp) => {
        const subject = 'Your CultureArc Verification Code';
        const text = `Your verification code is: ${otp}\n\nThis code expires in 15 minutes.`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #8B5CF6;">Email Verification</h1>
                <p>Your verification code is:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #8B5CF6; margin: 20px 0;">${otp}</div>
                <p>This code expires in 15 minutes.</p>
            </div>
        `;
        return sendEmail({ to: email, subject, text, html });
    }
};
