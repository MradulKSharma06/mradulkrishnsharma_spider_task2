const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/auth');
const auth = require('../middleware/auth.js')
const upload = require('../middleware/multer');

router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user", error: err.message });
  }
});

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

    user.profilePicture = req.file.path; // Cloudinary URL
    await user.save();

    res.json({ message: 'Profile picture updated', profilePicture: user.profilePicture });
  } catch (err) {
    console.error('Error uploading profile picture:', err);
    res.status(500).json({ message: 'Failed to upload profile picture' });
  }
});

module.exports = router;
