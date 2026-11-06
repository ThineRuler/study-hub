require('dotenv').config();

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ms = require('ms');

const User = require('../database/models/User');
const { sendEmail } = require('../resend');

// POST /sign-up
router.post('/sign-up', async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, displayName, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const error = new Error('User already exists');
      error.statusCode = 409;
      throw error;
    }

    // Hashing password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [user] = await User.create(
      [
        {
          email,
          passwordHash,
          displayName: displayName || name, // Fallback to name if sent from frontend
          isVerified: false,
        },
      ],
      { session }
    );

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const expiresInMs = ms(process.env.JWT_EXPIRES_IN);
    user.verifyToken = token;
    user.isVerified = false;
    user.verifyTokenExpires = new Date(Date.now() + expiresInMs);

    await user.save({ session });

    const verificationUrl = `${process.env.SERVER_URL}/api/auth/verify-email?token=${token}`;

    // Send verification email via Resend API
    await sendEmail({
      to: user.email,
      type: 'VERIFICATION',
      data: {
        name: user.displayName,
        verificationUrl,
      },
    });

    await session.commitTransaction();
    session.endSession();

    // Do not return passwordHash in response
    const sanitizedUser = user.toObject();
    delete sanitizedUser.passwordHash;

    res.status(201).json({
      success: true,
      message: 'User created successfully. Please check your email to verify your account.',
      data: {
        user: sanitizedUser,
      },
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    next(error);
  }
});

// POST /sign-in
router.post('/sign-in', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (!user.isVerified) {
      const error = new Error('User is not verified by email');
      error.statusCode = 403;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      const error = new Error('Invalid password');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const sanitizedUser = user.toObject();
    delete sanitizedUser.passwordHash;

    res.status(200).json({
      success: true,
      message: 'User signed in successfully',
      data: {
        token,
        user: sanitizedUser,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /sign-out
router.post('/sign-out', async (req, res, next) => { //front end sign out landing page
  try {
    res.status(200).json({
      success: true,
      message: 'User has been signed out',
    });
  } catch (error) {
    next(error);
  }
});

// GET /status (Check if user email has been verified)
router.get('/status', async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({
      isVerified: !!user.isVerified,
    });
  } catch (error) {
    next(error);
  }
});

// GET /verify-email
router.get('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      const error = new Error('Verification token is missing');
      error.statusCode = 400;
      throw error;
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      const error = new Error('Invalid or expired verification token');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({
      _id: decoded.userId,
      verifyToken: token,
      verifyTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      const error = new Error('Verification token is invalid or has expired');
      error.statusCode = 400;
      throw error;
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpires = undefined;

    await user.save();

    const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
    if (acceptsHtml) {
      return res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StudyHub · Email Verified</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #F8FAF8;
      color: #1F2922;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .card {
      background: #FFFFFF;
      border: 1px solid #E2E7E3;
      border-radius: 28px;
      padding: 44px 36px;
      max-width: 420px;
      width: 90%;
      text-align: center;
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.06);
    }
    .icon {
      width: 68px;
      height: 68px;
      border-radius: 20px;
      background: #EBF1EC;
      color: #395040;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 22px;
    }
    h1 {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 10px;
      color: #1F2922;
      letter-spacing: -0.02em;
    }
    .alert-box {
      background: #EBF1EC;
      border-radius: 14px;
      padding: 14px 18px;
      font-size: 13.5px;
      font-weight: 600;
      color: #273B2E;
      line-height: 1.5;
      margin: 18px 0;
    }
    p {
      font-size: 13.5px;
      line-height: 1.6;
      color: #5A6B5F;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    </div>
    <h1>Verification successful!</h1>
    <div class="alert-box">
      You can now close this tab.
    </div>
    <p>
      Your account is now verified and active.
    </p>
  </div>
</body>
</html>
      `);
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
    });
  } catch (error) {
    const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
    if (acceptsHtml) {
      return res.status(error.statusCode || 400).send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StudyHub · Verification Issue</title>
  <style>
    body {
      font-family: -apple-system, sans-serif;
      background: #F8FAF8;
      color: #1F2922;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
    }
    .card {
      background: white;
      border: 1px solid #E2E7E3;
      border-radius: 24px;
      padding: 36px;
      max-width: 400px;
      text-align: center;
    }
    h1 { font-size: 20px; color: #DC2626; margin-bottom: 12px; }
    p { font-size: 14px; color: #55685C; line-height: 1.5; }
    a { display: inline-block; margin-top: 20px; color: #405D48; font-weight: 600; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Verification link invalid or expired</h1>
    <p>${error.message || 'Please request a new link or try signing in.'}</p>
    <a href="http://localhost:5173/login">Return to StudyHub</a>
  </div>
</body>
</html>
      `);
    }
    next(error);
  }
});

// POST /resend-verification
router.post('/resend-verification', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      const error = new Error('Email is required');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: 'Account is already verified',
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const expiresInMs = ms(process.env.JWT_EXPIRES_IN);
    user.verifyToken = token;
    user.verifyTokenExpires = new Date(Date.now() + expiresInMs);
    await user.save();

    const verificationUrl = `${process.env.SERVER_URL}/api/auth/verify-email?token=${token}`;

    await sendEmail({
      to: user.email,
      type: 'VERIFICATION',
      data: {
        name: user.displayName,
        verificationUrl,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Verification email resent successfully',
    });
  } catch (error) {
    next(error);
  }
});

// POST /forgot-password
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      const error = new Error('Please provide an email address');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Combined secret ensures the token is invalidated as soon as the password changes
    const resetSecret = process.env.JWT_SECRET + user.passwordHash;

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      resetSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const expiresInMs = ms(process.env.JWT_EXPIRES_IN);

    user.resetTokenExpires = new Date(Date.now() + expiresInMs);
    user.resetToken = token;
    user.resetTokenVerified = false;
    await user.save();

    const resetUrl = `${process.env.SERVER_URL}/api/auth/reset-password?token=${token}`;

    await sendEmail({
      to: user.email,
      type: 'PASSWORD_RESET',
      data: {
        name: user.displayName,
        resetUrl,
      },
    });

    const sanitizedUser = user.toObject();
    delete sanitizedUser.passwordHash;

    res.status(200).json({
      success: true,
      message: 'If an account exists, a reset link has been sent.',
      body: {
        user: sanitizedUser
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /reset-status (Check if reset link was opened/verified)
router.get('/reset-status', async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValid = user.resetToken && user.resetTokenExpires && user.resetTokenExpires > new Date();
    const isVerified = Boolean(isValid && user.resetTokenVerified);

    res.status(200).json({
      isVerified,
      token: isVerified ? user.resetToken : undefined,
      id: isVerified ? user._id : undefined,
    });
  } catch (error) {
    next(error);
  }
});

// GET /reset-password (Clicking link in email)
router.get('/reset-password', async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      const error = new Error('Reset token is missing');
      error.statusCode = 400;
      throw error;
    }

    let decoded;
    try {
      decoded = jwt.decode(token);
    } catch {
      const error = new Error('Invalid token');
      error.statusCode = 400;
      throw error;
    }

    if (!decoded?.userId) {
      const error = new Error('Invalid token payload');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({
      _id: decoded.userId,
      resetToken: token,
      resetTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      const error = new Error('Password reset link is invalid or has expired');
      error.statusCode = 400;
      throw error;
    }

    const resetSecret = process.env.JWT_SECRET + user.passwordHash;
    try {
      jwt.verify(token, resetSecret);
    } catch (err) {
      const error = new Error('Password reset link is invalid or has expired');
      error.statusCode = 400;
      throw error;
    }

    // Mark as verified so polling tab knows
    user.resetTokenVerified = true;
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    return res.redirect(`${clientUrl}/reset-password?token=${encodeURIComponent(token)}&id=${user._id}`);
  } catch (error) {
    const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
    if (acceptsHtml) {
      return res.status(error.statusCode || 400).send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>StudyHub · Reset Link Expired</title>
  <style>
    body { font-family: -apple-system, sans-serif; background: #F8FAF8; color: #1F2922; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: white; border: 1px solid #E2E7E3; border-radius: 24px; padding: 36px; max-width: 400px; text-align: center; }
    h1 { font-size: 20px; color: #DC2626; margin-bottom: 12px; }
    p { font-size: 14px; color: #55685C; line-height: 1.5; }
    a { display: inline-block; margin-top: 20px; color: #405D48; font-weight: 600; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Password reset link expired</h1>
    <p>${error.message || 'Please request a new reset link.'}</p>
    <a href="http://localhost:5173/forgot-password">Request New Link →</a>
  </div>
</body>
</html>
      `);
    }
    next(error);
  }
});

// POST /reset-password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    let id = req.body.id;

    if (!token || !newPassword) {
      const error = new Error('Missing required fields');
      error.statusCode = 400;
      throw error;
    }

    if (!id) {
      const decoded = jwt.decode(token);
      id = decoded?.userId;
    }

    if (!id) {
      const error = new Error('Invalid user or token');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({
      _id: id,
      resetToken: token,
      resetTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      const error = new Error('Invalid user or expired token');
      error.statusCode = 400;
      throw error;
    }

    const resetSecret = process.env.JWT_SECRET + user.passwordHash;

    try {
      jwt.verify(token, resetSecret);
    } catch (err) {
      const error = new Error('Password reset link is invalid or has expired');
      error.statusCode = 400;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    user.resetTokenVerified = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now log in.',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;