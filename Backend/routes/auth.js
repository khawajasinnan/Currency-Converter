const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.post('/signup', authController.signup);
router.get('/verify', authController.verifyEmail);
router.post('/login', authController.login);
router.post('/request-reset', authController.requestPasswordReset);
router.post('/reset', authController.resetPassword);
router.post('/resend-verification', authController.resendVerificationEmail);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
