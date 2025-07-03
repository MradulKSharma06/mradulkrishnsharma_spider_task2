const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/auth');
const auth = require('../middleware/auth.js');
const upload = require('../middleware/multer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { sendOTPEmail } = require('../utils/email');

// Fetch user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
});

// Search users
router.get('/search', auth, async (req, res) => {
  const keyword = req.query.q;
  try {
    const users = await User.find({
      username: { $regex: keyword, $options: 'i' },
      _id: { $ne: req.user.id },
    }).select('username _id email profilePicture');

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Search failed' });
  }
});

// Add friend
router.post('/add-friend/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const friend = await User.findById(req.params.id);
    if (!friend) return res.status(404).json({ message: 'User not found' });

    if (user.friends.includes(friend._id)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    user.friends.push(friend._id);
    await user.save();

    res.json({ message: 'Friend added' });
  } catch (err) {
    res.status(500).json({ message: 'Could not add friend' });
  }
});

// Remove friend
router.post('/remove-friend/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.friends = user.friends.filter(id => id.toString() !== req.params.id);
    await user.save();

    res.json({ message: 'Friend removed' });
  } catch (err) {
    res.status(500).json({ message: 'Could not remove friend' });
  }
});

// Get friends
router.get('/friends', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('friends', 'username email profilePicture');
    res.json(user.friends);
  } catch (err) {
    console.error('Friends route error:', err);
    res.status(500).json({ message: 'Could not fetch friends' });
  }
});

// Upload profile picture
router.post('/profile-picture', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    console.log('Cloudinary Upload Result:', req.file);

    // Save Cloudinary URL
    user.profilePicture = req.file?.path || req.file?.secure_url || req.file?.url;
    await user.save();

    return res.status(200).json({
      message: 'Profile picture updated',
      profilePicture: user.profilePicture,
    });
  } catch (err) {
    console.error('Error uploading profile picture:', err);
    return res.status(500).json({ message: 'Failed to upload profile picture', error: err.message });
  }
});

// forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'Email not found' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // expires in 10 min

  user.otp = { code: otp, expiresAt: expiry };
  await user.save();

  try {
    await sendOTPEmail(email, otp);
    res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send OTP', error: err.message });
  }
});


// Reset Password: Verify OTP and set new password
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user || !user.otp) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  const isOtpExpired = user.otp.expiresAt < new Date();
  const isOtpValid = user.otp.code === otp;

  if (!isOtpValid || isOtpExpired) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  user.otp = undefined; // remove otp after success
  await user.save();

  res.json({ message: 'Password reset successful' });
});

module.exports = router;
