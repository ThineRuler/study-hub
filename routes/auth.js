require('dotenv').config();

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ms = require('ms');

const User = require('../database/models/User');
const { sendEmail } = require('../nodemailer');

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
      message: 'User created successfully',
      data: {
        user: sanitizedUser,
      },
    });
  } catch (error) {
    await session.abortTransaction();
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

    res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
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
    await user.save();

    const resetUrl = `${process.env.SERVER_URL}/api/auth/reset-password?token=${token}`; //needs reset landing page

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

// POST /reset-password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { id, token, newPassword } = req.body;

    if (!id || !token || !newPassword) {
      const error = new Error('Missing required fields');
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