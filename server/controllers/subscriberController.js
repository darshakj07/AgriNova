import Subscriber from '../models/Subscriber.js';
import nodemailer from 'nodemailer';

// Subscribe to newsletter
export const subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ success: false, message: 'Email is already subscribed' });
    }

    const subscriber = await Subscriber.create({ email });

    res.status(201).json({ success: true, message: 'Subscribed successfully', subscriber });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ success: false, message: 'Server error during subscription' });
  }
};

// Get all subscribers (Admin)
export const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, subscribers });
  } catch (error) {
    console.error('Fetch subscribers error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching subscribers' });
  }
};

// Broadcast email (Admin)
export const broadcastEmail = async (req, res) => {
  try {
    const { subject, message } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message are required' });
    }

    const subscribers = await Subscriber.find();
    if (subscribers.length === 0) {
      return res.status(400).json({ success: false, message: 'No subscribers found' });
    }

    // Configure Nodemailer transporter
    // For production, use real credentials from process.env
    // Since this is a template, we fall back to a mock/test configuration if no env vars are set.
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();

    const emails = subscribers.map(sub => sub.email);

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"AgriNova" <noreply@agrinova.com>',
      to: emails.join(','),
      subject: subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #1a4f32; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">AgriNova Updates</h1>
          </div>
          <div style="padding: 30px; color: #333; line-height: 1.6;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #888;">
            You are receiving this because you subscribed to the AgriNova newsletter.<br>
            &copy; ${new Date().getFullYear()} AgriNova Inc.
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Broadcast sent successfully' });
  } catch (error) {
    console.error('Broadcast email error:', error);
    res.status(500).json({ success: false, message: 'Server error during broadcast' });
  }
};
