const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, deleteProfile } = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes are protected with auth middleware
router.use(authMiddleware);

// Get user profile
router.get('/', getProfile);

// Update user profile
router.put('/', updateProfile);

// Delete user profile
router.delete('/', deleteProfile);

module.exports = router; 