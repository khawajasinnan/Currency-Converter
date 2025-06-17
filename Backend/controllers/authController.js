const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const transporter = require('../utils/mailer');

exports.signup = async (req, res) => {
  console.log('--- Signup endpoint hit! ---');
  console.log('--- Reached past the first log. ---');
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields are required.' });
  console.log('--- Passed required fields check. ---');
  console.log('--- Attempting to find existing user. ---');

  const existing = await User.findOne({ email });
  console.log('Result of findOne:', existing);
  if (existing) return res.status(400).json({ message: 'Email already registered' });

  try {
    const password_hash = await bcrypt.hash(password, 12);
    const verification_token = crypto.randomBytes(32).toString('hex');
    const user = new User({ name, email, password_hash, verification_token });
    console.log('New user instance created:', user);
    console.log('Attempting to save user...');
    await user.save();

    console.log('User saved to database.', user.email, user._id);

    // --- Start Email Sending Block ---
    console.log('About to attempt email sending...');
    const verifyUrl = `${process.env.FRONTEND_URL}/verify.html?token=${verification_token}&email=${email}`;
    
    console.log('Attempting to send verification email to:', email);
    console.log('Verification URL:', verifyUrl);

    console.log('Calling transporter.sendMail...');
    try {
        let info = await transporter.sendMail({
            to: email,
            subject: 'Verify your email',
            html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`
        });
        console.log('Verification email sent successfully!', info.messageId, info.response);
    } catch (emailError) {
        console.error('!!! ERROR SENDING VERIFICATION EMAIL !!!', emailError);
        console.error('Email error details:', emailError.message, emailError.response, emailError.responseCode);
        // Log the error, but don't necessarily prevent user creation.
        // The user will just need to request a new verification email later.
    }
     // --- End Email Sending Block ---

    // Respond to frontend after user is saved, regardless of email send status
    res.status(201).json({ message: 'User registered. Please verify your email.' });

  } catch (error) {
    console.error('Signup process error (saving user):', error);
    // This catch is for errors during hashing, token generation, or user save.
    res.status(500).json({ message: 'An internal server error occurred during signup.' });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token, email } = req.query;
  try {
    const user = await User.findOne({ email, verification_token: token });
    if (!user) return res.status(400).json({ message: 'Invalid verification link.' });
    
    user.is_verified = true;
    user.verification_token = undefined;
    await user.save();
    
    res.json({ message: 'Email verified. You can now log in.' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'An error occurred during verification.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials.' });
    if (!user.is_verified) return res.status(400).json({ message: 'Please verify your email.' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials.' });

    user.last_login = new Date();
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An error occurred during login.' });
  }
};

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'No user with that email.' });

  const reset_token = crypto.randomBytes(32).toString('hex');
  user.reset_token = reset_token;
  user.reset_token_expiry = Date.now() + 1000 * 60 * 60; // 1 hour
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset.html?token=${reset_token}&email=${email}`;
  await transporter.sendMail({
    to: email,
    subject: 'Password Reset',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`
  });

  res.json({ message: 'Password reset email sent.' });
};

exports.resetPassword = async (req, res) => {
  const { token, email, password } = req.body;
  const user = await User.findOne({ email, reset_token: token, reset_token_expiry: { $gt: Date.now() } });
  if (!user) return res.status(400).json({ message: 'Invalid or expired reset link.' });

  user.password_hash = await bcrypt.hash(password, 12);
  user.reset_token = undefined;
  user.reset_token_expiry = undefined;
  await user.save();

  res.json({ message: 'Password reset successful. You can now log in.' });
};

// Add new function for resending verification email
exports.resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.is_verified) {
      return res.status(400).json({ message: 'Email is already verified.' });
    }

    // Generate a new verification token
    const verification_token = crypto.randomBytes(32).toString('hex');
    user.verification_token = verification_token;
    await user.save();

    // Send verification email (reusing the same logic as signup)
    const verifyUrl = `${process.env.FRONTEND_URL}/verify.html?token=${verification_token}&email=${email}`;

    console.log('Attempting to resend verification email to:', email);
    console.log('Verification URL for resend:', verifyUrl);

    try {
        let info = await transporter.sendMail({
            to: email,
            subject: 'Verify your email',
            html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`
        });
        console.log('Resend verification email sent successfully!', info.messageId, info.response);
    } catch (emailError) {
        console.error('!!! ERROR SENDING RESEND VERIFICATION EMAIL !!!', emailError);
        console.error('Resend email error details:', emailError.message, emailError.response, emailError.responseCode);
        return res.status(500).json({ message: 'Error sending verification email.' });
    }

    res.json({ message: 'Verification email sent. Please check your inbox.' });

  } catch (error) {
    console.error('Resend verification email error:', error);
    res.status(500).json({ message: 'An internal server error occurred during resending verification email.' });
  }
};

exports.logout = async (req, res) => {
    try {
        // Clear the token from the client-side (localStorage)
        // The token is already invalidated by the auth middleware
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout Error:', error);
        res.status(500).json({ message: 'An error occurred during logout' });
    }
};
 
