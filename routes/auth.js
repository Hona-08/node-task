const express = require('express');
const { signup, verifyEmail, login, profile, updateProfile, deleteProfile, resetPassword, confirmPasswordReset, getUsers } = require('../controllers/authController');
const { authenticateToken} = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signup);
router.get('/verify/:token', verifyEmail);
router.post('/login', login);
router.get('/profile', authenticateToken, profile);
router.put('/profile', authenticateToken, updateProfile);
router.delete('/profile', authenticateToken, deleteProfile);
router.post('/reset', resetPassword);
router.post('/reset/:token', confirmPasswordReset);
// router.get('/users', authenticateToken, authorizeRole(['admin']), getUsers);
router.get('/users',getUsers)

module.exports = router;
