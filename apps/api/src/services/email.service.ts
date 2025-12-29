import nodemailer, { Transporter } from 'nodemailer';
import config from '../config';
import { logger } from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: config.email.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      logger.info(`Email sent to ${options.to}: ${options.subject}`);
    } catch (error) {
      logger.error('Error sending email:', error);
      // Don't throw - email failures shouldn't break the main flow
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(email: string, userId: number, token: string): Promise<void> {
    const verificationUrl = `${config.clientUrl}/verify-email?token=${token}`;
    
    await this.sendEmail({
      to: email,
      subject: 'Verify Your Email - E-Commerce',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 4px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to E-Commerce!</h1>
            </div>
            <div class="content">
              <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
              <p style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email</a>
              </p>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; color: #4F46E5;">${verificationUrl}</p>
              <p>This link will expire in 24 hours.</p>
            </div>
            <div class="footer">
              <p>If you didn't create this account, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Welcome to E-Commerce! Please verify your email by visiting: ${verificationUrl}`,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${config.clientUrl}/reset-password?token=${token}`;
    
    await this.sendEmail({
      to: email,
      subject: 'Password Reset Request - E-Commerce',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #DC2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background: #DC2626; color: white; text-decoration: none; border-radius: 4px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset</h1>
            </div>
            <div class="content">
              <p>You requested a password reset. Click the button below to set a new password:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; color: #DC2626;">${resetUrl}</p>
              <p>This link will expire in 1 hour.</p>
              <p><strong>If you didn't request this, please ignore this email.</strong></p>
            </div>
            <div class="footer">
              <p>For security, this request was received from your account.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `You requested a password reset. Visit this link to reset your password: ${resetUrl}. This link expires in 1 hour.`,
    });
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(
    email: string,
    orderId: string,
    orderDetails: {
      items: Array<{ title: string; quantity: number; price: number }>;
      subtotal: number;
      tax: number;
      shipping: number;
      total: number;
    }
  ): Promise<void> {
    const itemsHtml = orderDetails.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
        </tr>
      `
      )
      .join('');

    await this.sendEmail({
      to: email,
      subject: `Order Confirmation #${orderId} - E-Commerce`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #059669; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f0f0f0; padding: 10px; text-align: left; }
            .total-row { font-weight: bold; background: #f0f0f0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmed!</h1>
              <p>Order #${orderId}</p>
            </div>
            <div class="content">
              <p>Thank you for your order! Here's a summary:</p>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding: 10px; text-align: right;">Subtotal:</td>
                    <td style="padding: 10px; text-align: right;">$${orderDetails.subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding: 10px; text-align: right;">Tax:</td>
                    <td style="padding: 10px; text-align: right;">$${orderDetails.tax.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding: 10px; text-align: right;">Shipping:</td>
                    <td style="padding: 10px; text-align: right;">$${orderDetails.shipping.toFixed(2)}</td>
                  </tr>
                  <tr class="total-row">
                    <td colspan="2" style="padding: 10px; text-align: right;">Total:</td>
                    <td style="padding: 10px; text-align: right;">$${orderDetails.total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
              <p style="margin-top: 20px;">You can track your order status in your account dashboard.</p>
            </div>
            <div class="footer">
              <p>Thank you for shopping with us!</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Order Confirmed! Order #${orderId}. Total: $${orderDetails.total.toFixed(2)}`,
    });
  }

  /**
   * Send order shipped notification
   */
  async sendOrderShippedEmail(
    email: string,
    orderId: string,
    trackingNumber: string,
    carrier: string,
    estimatedDelivery?: Date
  ): Promise<void> {
    const trackingUrl = this.getTrackingUrl(carrier, trackingNumber);
    
    await this.sendEmail({
      to: email,
      subject: `Your Order #${orderId} Has Shipped! - E-Commerce`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563EB; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .tracking-box { background: white; padding: 15px; border-radius: 4px; margin: 15px 0; }
            .button { display: inline-block; padding: 12px 24px; background: #2563EB; color: white; text-decoration: none; border-radius: 4px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Order Has Shipped!</h1>
            </div>
            <div class="content">
              <p>Great news! Your order #${orderId} is on its way.</p>
              <div class="tracking-box">
                <p><strong>Carrier:</strong> ${carrier}</p>
                <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
                ${estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${estimatedDelivery.toLocaleDateString()}</p>` : ''}
              </div>
              <p style="text-align: center;">
                <a href="${trackingUrl}" class="button">Track Package</a>
              </p>
            </div>
            <div class="footer">
              <p>Thank you for shopping with us!</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Your order #${orderId} has shipped! Carrier: ${carrier}, Tracking: ${trackingNumber}`,
    });
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Welcome to E-Commerce!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 4px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome, ${firstName}!</h1>
            </div>
            <div class="content">
              <p>Thank you for joining E-Commerce! We're excited to have you.</p>
              <p>Here's what you can do:</p>
              <ul>
                <li>Browse our latest products</li>
                <li>Create wishlists</li>
                <li>Track your orders</li>
                <li>Get personalized recommendations</li>
              </ul>
              <p style="text-align: center;">
                <a href="${config.clientUrl}/products" class="button">Start Shopping</a>
              </p>
            </div>
            <div class="footer">
              <p>Happy shopping!</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Welcome to E-Commerce, ${firstName}! Start shopping at ${config.clientUrl}`,
    });
  }

  /**
   * Get tracking URL based on carrier
   */
  private getTrackingUrl(carrier: string, trackingNumber: string): string {
    const carrierUrls: Record<string, string> = {
      ups: `https://www.ups.com/track?tracknum=${trackingNumber}`,
      fedex: `https://www.fedex.com/apps/fedextrack/?tracknumbers=${trackingNumber}`,
      usps: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
      dhl: `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
    };

    return carrierUrls[carrier.toLowerCase()] || `https://track17.net/en/${trackingNumber}`;
  }

  // ===== DTC Feature: Enhanced Email Templates (5.5) =====

  /**
   * Send abandoned cart reminder email
   */
  async sendAbandonedCartEmail(
    email: string,
    firstName: string,
    items: Array<{ name: string; imageUrl: string; price: number; quantity: number }>,
    cartUrl: string
  ): Promise<void> {
    const itemsHtml = items
      .map(
        (item) => `
        <div style="display: flex; align-items: center; gap: 16px; padding: 16px; border-bottom: 1px solid #f3f4f6;">
          <img src="${item.imageUrl}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
          <div>
            <p style="margin: 0; color: #111827; font-weight: 600;">${item.name}</p>
            <p style="margin: 4px 0 0; color: #4f46e5; font-weight: 600;">$${item.price.toFixed(2)} × ${item.quantity}</p>
          </div>
        </div>
      `
      )
      .join('');

    await this.sendEmail({
      to: email,
      subject: 'Did you forget something? 🛒',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }
          </style>
        </head>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h1 style="font-size: 24px; color: #111827; text-align: center;">You Left Something Behind!</h1>
              <p style="color: #4b5563; font-size: 16px; text-align: center;">
                Your cart is waiting for you, ${firstName}.
              </p>
              <div style="margin: 24px 0;">
                ${itemsHtml}
              </div>
              <div style="text-align: center; margin-top: 32px;">
                <a href="${cartUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                  Complete Your Order
                </a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hi ${firstName}, you left items in your cart. Complete your order at ${cartUrl}`,
    });
  }

  /**
   * Send birthday reward email
   */
  async sendBirthdayRewardEmail(
    email: string,
    firstName: string,
    reward: string,
    code: string,
    shopUrl: string
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: "Happy Birthday! 🎂 Here's a gift for you",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }
          </style>
        </head>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 40px; text-align: center;">
              <span style="font-size: 64px;">🎂</span>
              <h1 style="color: white; font-size: 28px; margin: 16px 0;">Happy Birthday, ${firstName}!</h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 16px;">We hope your day is as special as you are.</p>
              <div style="background: white; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <p style="color: #6b7280; margin: 0 0 8px;">Your birthday gift</p>
                <p style="color: #111827; font-size: 36px; font-weight: 700; margin: 0;">${reward}</p>
                <p style="color: #6b7280; margin: 8px 0 0; font-size: 14px;">Use code: <strong>${code}</strong></p>
              </div>
              <a href="${shopUrl}" style="display: inline-block; background: white; color: #764ba2; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Treat Yourself
              </a>
              <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin-top: 24px;">
                Valid for 30 days from your birthday
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Happy Birthday, ${firstName}! Here's your gift: ${reward}. Use code: ${code}`,
    });
  }

  /**
   * Send back in stock notification
   */
  async sendBackInStockEmail(
    email: string,
    productName: string,
    productImage: string,
    price: number,
    productUrl: string
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `${productName} is back in stock! ⚡`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }
          </style>
        </head>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="text-align: center;">
                <span style="font-size: 48px;">⚡</span>
                <h1 style="font-size: 24px; color: #111827; margin: 16px 0;">It's Back!</h1>
                <p style="color: #4b5563;">The item you've been waiting for is back in stock.</p>
                <img src="${productImage}" alt="${productName}" style="max-width: 200px; margin: 24px 0; border-radius: 12px;">
                <h2 style="color: #111827; margin: 0;">${productName}</h2>
                <p style="color: #4f46e5; font-size: 24px; font-weight: 600;">$${price.toFixed(2)}</p>
                <p style="color: #ef4444; font-size: 14px;">Limited quantities - get yours before it sells out again!</p>
                <a href="${productUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
                  Buy Now
                </a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `${productName} is back in stock! Get yours at ${productUrl}`,
    });
  }

  /**
   * Send subscription reminder email
   */
  async sendSubscriptionReminderEmail(
    email: string,
    firstName: string,
    deliveryDate: string,
    cutoffDate: string,
    items: Array<{ name: string; quantity: number }>,
    manageUrl: string
  ): Promise<void> {
    const itemsHtml = items
      .map((item) => `<p style="margin: 8px 0; color: #4b5563;">${item.name} × ${item.quantity}</p>`)
      .join('');

    await this.sendEmail({
      to: email,
      subject: 'Your subscription delivery is coming up 📦',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }
          </style>
        </head>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h1 style="font-size: 24px; color: #111827; text-align: center;">Delivery Coming Up! 📦</h1>
              <p style="color: #4b5563; font-size: 16px; text-align: center;">
                Hi ${firstName}, your next subscription delivery is scheduled for <strong>${deliveryDate}</strong>.
              </p>
              <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px; color: #111827;">Your Order:</h3>
                ${itemsHtml}
              </div>
              <p style="color: #6b7280; text-align: center;">
                Need to make changes? You have until ${cutoffDate} to modify your order.
              </p>
              <div style="text-align: center; margin-top: 24px;">
                <a href="${manageUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                  Manage Subscription
                </a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hi ${firstName}, your subscription delivery is scheduled for ${deliveryDate}. Manage at ${manageUrl}`,
    });
  }

  /**
   * Send review request email
   */
  async sendReviewRequestEmail(
    email: string,
    firstName: string,
    productName: string,
    productImage: string,
    reviewUrl: string
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `How are you enjoying your ${productName}?`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }
          </style>
        </head>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h1 style="font-size: 24px; color: #111827; text-align: center;">We'd Love Your Feedback!</h1>
              <p style="color: #4b5563; font-size: 16px; text-align: center;">
                Hi ${firstName}, how are you enjoying your ${productName}?
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <img src="${productImage}" alt="${productName}" style="max-width: 200px; border-radius: 12px;">
              </div>
              <p style="color: #6b7280; text-align: center; margin-bottom: 24px;">
                Share your experience and earn 50 loyalty points!
              </p>
              <div style="text-align: center;">
                <a href="${reviewUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                  Write a Review
                </a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hi ${firstName}, how are you enjoying your ${productName}? Leave a review at ${reviewUrl}`,
    });
  }

  /**
   * Send loyalty points earned notification
   */
  async sendLoyaltyPointsEarnedEmail(
    email: string,
    firstName: string,
    pointsEarned: number,
    reason: string,
    totalPoints: number,
    rewardsUrl: string
  ): Promise<void> {
    const pointsValue = (totalPoints / 100) * 5; // 100 points = $5

    await this.sendEmail({
      to: email,
      subject: `You earned ${pointsEarned} points! ⭐`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }
          </style>
        </head>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
              <span style="font-size: 48px;">⭐</span>
              <h1 style="font-size: 24px; color: #111827; margin: 16px 0;">Points Earned!</h1>
              <p style="color: #4b5563;">Hi ${firstName}, you just earned points for ${reason}.</p>
              <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 12px; padding: 24px; margin: 24px 0;">
                <p style="color: white; font-size: 48px; font-weight: 700; margin: 0;">+${pointsEarned}</p>
                <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">points</p>
              </div>
              <p style="color: #111827; font-size: 18px; font-weight: 600;">Total Balance: ${totalPoints} points</p>
              <p style="color: #6b7280; font-size: 14px;">That's worth $${pointsValue.toFixed(2)} in rewards!</p>
              <a href="${rewardsUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
                View Rewards
              </a>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hi ${firstName}, you earned ${pointsEarned} points for ${reason}. Total: ${totalPoints} points.`,
    });
  }

  /**
   * Send referral invite email
   */
  async sendReferralInviteEmail(
    email: string,
    referrerName: string,
    discount: string,
    referralUrl: string,
    brandName: string = 'E-Commerce'
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `${referrerName} thinks you'll love ${brandName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }
          </style>
        </head>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
              <h1 style="font-size: 24px; color: #111827;">You've Been Invited!</h1>
              <p style="color: #4b5563; font-size: 16px;">
                ${referrerName} thinks you'd love ${brandName} and wants to share ${discount} off your first order.
              </p>
              <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <p style="color: #111827; font-size: 36px; font-weight: 700; margin: 0;">${discount}</p>
                <p style="color: #6b7280; margin: 8px 0 0;">Your exclusive discount</p>
              </div>
              <a href="${referralUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Claim Your Discount
              </a>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `${referrerName} invited you to ${brandName}! Get ${discount} off at ${referralUrl}`,
    });
  }

  /**
   * Send drop notification email
   */
  async sendDropNotificationEmail(
    email: string,
    firstName: string,
    dropName: string,
    dropDate: string,
    dropTime: string,
    productImage: string,
    dropUrl: string
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `🔥 ${dropName} drops soon!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #111827; }
          </style>
        </head>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); border-radius: 16px; padding: 40px; text-align: center; border: 1px solid #374151;">
              <span style="font-size: 48px;">🔥</span>
              <h1 style="color: white; font-size: 28px; margin: 16px 0;">${dropName}</h1>
              <p style="color: #9ca3af; font-size: 16px;">Get ready, ${firstName}. The drop you've been waiting for is almost here.</p>
              <div style="margin: 24px 0;">
                <img src="${productImage}" alt="${dropName}" style="max-width: 300px; border-radius: 12px;">
              </div>
              <div style="background: rgba(79, 70, 229, 0.2); border: 1px solid #4f46e5; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <p style="color: #9ca3af; margin: 0 0 8px; font-size: 14px;">DROPS</p>
                <p style="color: white; font-size: 24px; font-weight: 700; margin: 0;">${dropDate} at ${dropTime}</p>
              </div>
              <a href="${dropUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Set Reminder
              </a>
              <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
                First come, first served. Don't miss out!
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `${dropName} drops ${dropDate} at ${dropTime}. Get ready at ${dropUrl}`,
    });
  }
}

export const emailService = new EmailService();
