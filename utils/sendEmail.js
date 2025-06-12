// utils/sendEmail.js
const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        service: 'gmail', // or your preferred email service
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // Use app password for Gmail
        },
    });
};

// Send email function
const sendEmail = async (options) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Vizima Property Rental" <${process.env.EMAIL_FROM}>`,
            to: options.email,
            subject: options.subject,
            html: options.html,
            text: options.text,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email sending failed:', error);
        throw new Error(`Email sending failed: ${error.message}`);
    }
};

// Email templates
const emailTemplates = {
    // Welcome email template
    welcome: (name) => ({
        subject: 'Welcome to Vizima Property Rental',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to Vizima</h1>
        </div>
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Hello ${name}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for joining Vizima Property Rental. We're excited to help you find your perfect property or list your property for rent.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Explore Properties
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If you have any questions, feel free to contact our support team.
          </p>
        </div>
        <div style="background: #333; color: white; text-align: center; padding: 10px;">
          <p style="margin: 0; font-size: 12px;">&copy; 2024 Vizima Property Rental. All rights reserved.</p>
        </div>
      </div>
    `,
    }),

    // Email verification template
    emailVerification: (name, verificationUrl) => ({
        subject: 'Verify Your Email Address',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Email Verification</h1>
        </div>
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Hello ${name}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Please verify your email address by clicking the button below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #667eea;">${verificationUrl}</a>
          </p>
          <p style="color: #666; font-size: 12px;">
            This link will expire in 24 hours.
          </p>
        </div>
      </div>
    `,
    }),

    // Password reset template
    passwordReset: (name, resetUrl) => ({
        subject: 'Reset Your Password',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Password Reset</h1>
        </div>
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Hello ${name}!</h2>
          <p style="color: #666; line-height: 1.6;">
            You requested to reset your password. Click the button below to set a new password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If you didn't request this, please ignore this email.<br>
            This link will expire in 1 hour.
          </p>
        </div>
      </div>
    `,
    }),

    // Booking confirmation template
    bookingConfirmation: (guestName, propertyTitle, checkIn, checkOut, totalAmount, bookingId) => ({
        subject: 'Booking Confirmation - Vizima Property Rental',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Booking Confirmed!</h1>
        </div>
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Hello ${guestName}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Your booking has been confirmed. Here are the details:
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Booking Details</h3>
            <p><strong>Property:</strong> ${propertyTitle}</p>
            <p><strong>Check-in:</strong> ${checkIn}</p>
            <p><strong>Check-out:</strong> ${checkOut}</p>
            <p><strong>Total Amount:</strong> $${totalAmount}</p>
            <p><strong>Booking ID:</strong> ${bookingId}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/bookings" style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Booking
            </a>
          </div>
        </div>
      </div>
    `,
    }),

    // New booking notification for host
    newBookingNotification: (hostName, guestName, propertyTitle, checkIn, checkOut, bookingId) => ({
        subject: 'New Booking Received - Vizima Property Rental',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6610f2 0%, #e83e8c 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Booking!</h1>
        </div>
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Hello ${hostName}!</h2>
          <p style="color: #666; line-height: 1.6;">
            You have received a new booking for your property:
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Booking Details</h3>
            <p><strong>Guest:</strong> ${guestName}</p>
            <p><strong>Property:</strong> ${propertyTitle}</p>
            <p><strong>Check-in:</strong> ${checkIn}</p>
            <p><strong>Check-out:</strong> ${checkOut}</p>
            <p><strong>Booking ID:</strong> ${bookingId}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/host/bookings" style="background: #6610f2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Manage Booking
            </a>
          </div>
        </div>
      </div>
    `,
    }),

    // Booking cancellation template
    bookingCancellation: (userName, propertyTitle, bookingId, reason) => ({
        subject: 'Booking Cancelled - Vizima Property Rental',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Booking Cancelled</h1>
        </div>
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Hello ${userName}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Your booking has been cancelled:
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Property:</strong> ${propertyTitle}</p>
            <p><strong>Booking ID:</strong> ${bookingId}</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          </div>
          <p style="color: #666; font-size: 14px;">
            If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    `,
    }),
};

// Notification service
class NotificationService {
    // Send welcome email
    static async sendWelcomeEmail(email, name) {
        const template = emailTemplates.welcome(name);
        return await sendEmail({
            email,
            subject: template.subject,
            html: template.html,
        });
    }

    // Send email verification
    static async sendEmailVerification(email, name, verificationToken) {
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        const template = emailTemplates.emailVerification(name, verificationUrl);
        return await sendEmail({
            email,
            subject: template.subject,
            html: template.html,
        });
    }

    // Send password reset email
    static async sendPasswordResetEmail(email, name, resetToken) {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        const template = emailTemplates.passwordReset(name, resetUrl);
        return await sendEmail({
            email,
            subject: template.subject,
            html: template.html,
        });
    }

    // Send booking confirmation
    static async sendBookingConfirmation(booking) {
        const template = emailTemplates.bookingConfirmation(
            booking.guest.name,
            booking.property.title,
            new Date(booking.checkInDate).toLocaleDateString(),
            new Date(booking.checkOutDate).toLocaleDateString(),
            booking.totalAmount,
            booking._id
        );
        return await sendEmail({
            email: booking.guest.email,
            subject: template.subject,
            html: template.html,
        });
    }

    // Send new booking notification to host
    static async sendNewBookingNotification(booking) {
        const template = emailTemplates.newBookingNotification(
            booking.property.owner.name,
            booking.guest.name,
            booking.property.title,
            new Date(booking.checkInDate).toLocaleDateString(),
            new Date(booking.checkOutDate).toLocaleDateString(),
            booking._id
        );
        return await sendEmail({
            email: booking.property.owner.email,
            subject: template.subject,
            html: template.html,
        });
    }

    // Send booking cancellation notification
    static async sendBookingCancellation(booking, reason = '') {
        const template = emailTemplates.bookingCancellation(
            booking.guest.name,
            booking.property.title,
            booking._id,
            reason
        );
        return await sendEmail({
            email: booking.guest.email,
            subject: template.subject,
            html: template.html,
        });
    }

    // Send custom email
    static async sendCustomEmail(email, subject, html, text = '') {
        return await sendEmail({
            email,
            subject,
            html,
            text,
        });
    }
}

module.exports = {
    sendEmail,
    emailTemplates,
    NotificationService,
};