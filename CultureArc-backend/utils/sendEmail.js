const nodemailer = require('nodemailer');
const RESEND_EMAIL_ENDPOINT = 'https://api.resend.com/emails';

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
        // 1. Check if standard SMTP Gmail is configured (highly reliable, sends to any recipient)
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER.trim(),
                    pass: process.env.EMAIL_PASS.trim()
                }
            });

            const mailOptions = {
                from: `"CultureArc" <${process.env.EMAIL_USER.trim()}>`,
                to,
                subject,
                text,
                html: html || text
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent successfully via Gmail SMTP:', info.messageId);
            return { success: true, messageId: info.messageId };
        }

        // 2. Fallback to Resend if RESEND_API_KEY is configured
        if (process.env.RESEND_API_KEY) {
            const mailOptions = {
                from: process.env.RESEND_FROM_EMAIL || 'CultureArc <onboarding@resend.dev>',
                to,
                subject,
                text,
                html: html || text
            };

            const response = await fetch(RESEND_EMAIL_ENDPOINT, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(mailOptions)
            });

            const result = await response.json();

            if (!response.ok) {
                const message = result?.message || result?.error || 'Failed to send email';
                throw new Error(message);
            }

            console.log('Email sent via Resend:', result.id);
            return { success: true, messageId: result.id };
        }

        // 3. Fallback to logging (simulation mode) if neither is configured
        console.log('Email not configured. Would have sent:');
        console.log({ to, subject, text });
        return { success: true, messageId: 'simulation-only' };
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
    // sendOtpEmail and sendPasswordResetOtpEmail are below
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
    },
    sendPasswordResetOtpEmail: async (email, otp) => {
        const subject = 'CultureArc Password Reset Code';
        const text = `Your password reset code is: ${otp}\n\nThis code expires in 15 minutes. If you did not request this, please ignore this email.`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #8B5CF6;">Password Reset Request</h1>
                <p>You requested to reset your password. Use the following code to proceed:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #8B5CF6; margin: 20px 0;">${otp}</div>
                <p>This code expires in 15 minutes.</p>
                <p style="color: #666; font-size: 12px;">If you did not request a password reset, you can safely ignore this email.</p>
            </div>
        `;
        return sendEmail({ to: email, subject, text, html });
    }
};
