"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = __importDefault(require("./logger"));
class EmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransporter({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    async sendEmail(options) {
        try {
            const mailOptions = {
                from: `"PolyglotCodeHub" <${process.env.SMTP_USER}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
            };
            const info = await this.transporter.sendMail(mailOptions);
            logger_1.default.info({ messageId: info.messageId, to: options.to }, 'Email sent successfully');
        }
        catch (error) {
            logger_1.default.error({ error, to: options.to }, 'Failed to send email');
            throw error;
        }
    }
    generateVerificationEmailHtml(token) {
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verify Your Email - PolyglotCodeHub</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #6200EE; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9f9f9; }
            .button { display: inline-block; background: #6200EE; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to PolyglotCodeHub!</h1>
            </div>
            <div class="content">
              <h2>Verify Your Email Address</h2>
              <p>Thank you for signing up! Please click the button below to verify your email address and activate your account.</p>
              <a href="${verificationUrl}" class="button">Verify Email</a>
              <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
              <p><a href="${verificationUrl}">${verificationUrl}</a></p>
              <p>This link will expire in 15 minutes for security reasons.</p>
            </div>
            <div class="footer">
              <p>If you didn't create an account, please ignore this email.</p>
              <p>&copy; 2024 PolyglotCodeHub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    }
    generatePasswordResetEmailHtml(token) {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password - PolyglotCodeHub</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #6200EE; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9f9f9; }
            .button { display: inline-block; background: #6200EE; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset</h1>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>You requested a password reset for your PolyglotCodeHub account. Click the button below to reset your password.</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
              <p><a href="${resetUrl}">${resetUrl}</a></p>
              <p>This link will expire in 15 minutes for security reasons.</p>
              <p>If you didn't request this reset, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 PolyglotCodeHub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    }
}
exports.emailService = new EmailService();
exports.default = exports.emailService;
