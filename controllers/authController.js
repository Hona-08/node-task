const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { db } = require('../db/db');
const { createUser, findUserByEmail, updateUser, deleteUser, updateUserByEmail, getAllUsers, countUsers } = require('../models/user');
require('dotenv').config();

// Configure the nodemailer transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Signup function
const signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).send('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    await createUser({ name, email, password: hashedPassword, verificationToken, role });
    const verificationLink = `http://localhost:3000/api/auth/verify/${verificationToken}`;

    await transporter.sendMail({
      to: email,
      subject: 'Verify your email',
      html: `<a href="${verificationLink}">Verify your email</a>`
    });

    res.status(201).send('User created, verification email sent');
  } catch (err) {
    res.status(500).send('Internal server error');
  }
};

// Verify email function
const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await db('users').where({ verificationToken: token }).first();
    if (!user) {
      return res.status(400).send('Invalid token');
    }

    await updateUser(user.id, { verified: true, verificationToken: null });
    res.send('Email verified');
  } catch (err) {
    res.status(500).send('Internal server error');
  }
};

// Login function
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).send('Invalid credentials');
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).send('Internal server error');
  }
};

// Profile function
const profile = async (req, res) => {
  res.json(req.user);
};

// Update profile function
const updateProfile = async (req, res) => {
  const { name, email } = req.body;

  try {
    await updateUser(req.user.id, { name, email });
    res.send('Profile updated');
  } catch (err) {
    res.status(400).send('Error updating profile');
  }
};

// Delete profile function
const deleteProfile = async (req, res) => {
  try {
    await deleteUser(req.user.id);
    res.send('User deleted');
  } catch (err) {
    res.status(400).send('Error deleting user');
  }
};

// Reset password function
const resetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).send('User not found');
    }

    const resetPasswordToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await updateUserByEmail(email, { resetPasswordToken, resetPasswordExpires });

    const resetLink = `http://localhost:3000/api/auth/reset/${resetPasswordToken}`;

    await transporter.sendMail({
      to: email,
      subject: 'Reset your password',
      html: `<a href="${resetLink}">Reset your password</a>`
    });

    res.send('Password reset email sent');
  } catch (err) {
    res.status(500).send('Internal server error');
  }
};

// Confirm password reset function
const confirmPasswordReset = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await db('users')
      .where('resetPasswordToken', token)
      .andWhere('resetPasswordExpires', '>', new Date())
      .first();

    if (!user) {
      return res.status(400).send('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await updateUser(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    res.send('Password reset successfully');
  } catch (err) {
    res.status(500).send('Internal server error');
  }
};

// Get users function (with pagination and filtering)
const getUsers = async (req, res) => {
  const { page = 1, limit = 10, role } = req.query;
  const offset = (page - 1) * limit;

  const filters = {};
  if (role) {
    filters.role = role;
  }

  try {
    const users = await getAllUsers(filters, limit, offset);
    const count = await countUsers(filters);

    res.json({ users, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).send('Internal server error');
  }
};


module.exports = {
  signup,
  verifyEmail,
  login,
  profile,
  updateProfile,
  deleteProfile,
  resetPassword,
  confirmPasswordReset,
  getUsers
};
