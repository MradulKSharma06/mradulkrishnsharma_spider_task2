const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  const { name, description, type, memberIds } = req.body;

  if (!Array.isArray(memberIds)) {
    return res.status(400).json({ message: 'memberIds must be an array of user IDs' });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const friendsSet = new Set(user.friends.map(id => id.toString()));
    for (const mId of memberIds) {
      if (!friendsSet.has(mId)) {
        return res.status(400).json({ message: 'Can only add your friends to group' });
      }
    }

    const members = [...new Set([req.userId, ...memberIds])];

    const group = new Group({
      name,
      description,
      type,
      creator: req.userId,
      members
    });

    await group.save();
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: 'Error creating group', error: err.message });
  }
});

// Get a single group's details
router.get('/:groupId', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate('members', 'username email');
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Ensure the requesting user is a member of this group
    const isMember = group.members.some(member => member._id.toString() === req.userId);
    if (!isMember) return res.status(403).json({ message: 'You are not a member of this group' });

    res.json(group);
  } catch (err) {
    console.error('Error fetching group:', err.message);
    res.status(500).json({ message: 'Failed to fetch group', error: err.message });
  }
});

// Get all groups for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.userId }).populate('members', 'username email');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch groups' });
  }
});

// Remove a member from group (only creator can do this)
router.post('/:groupId/remove-member/:memberId', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.creator.toString() !== req.userId) return res.status(403).json({ message: 'Only creator can remove members' });

    group.members = group.members.filter(m => m.toString() !== req.params.memberId);
    await group.save();
    res.json({ message: 'Member removed', group });
  } catch (err) {
    res.status(500).json({ message: 'Could not remove member' });
  }
});

// Get pairwise balances in a group
router.get('/balances/:groupId', auth, async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId).populate('members', 'username');
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const expenses = await Expense.find({ group: groupId });
    console.log('Expenses found:', expenses);

    const balances = {};

    for (const exp of expenses) {
      const payer = exp.paidBy.toString();

      for (const split of exp.splitAmounts) {
        const participant = split.user.toString();
        if (participant === payer) continue; 

        const key = `${participant}_${payer}`;
        balances[key] = (balances[key] || 0) + split.amount;
      }
    }

    console.log('Raw balances before simplify:', balances);  

    // Simplify balances
    const simplified = {};

    for (const key in balances) {
      const [from, to] = key.split('_');
      const reverseKey = `${to}_${from}`;
      const forwardAmount = balances[key];
      const reverseAmount = balances[reverseKey] || 0;

      if (forwardAmount > reverseAmount) {
        simplified[`${from}_${to}`] = +(forwardAmount - reverseAmount).toFixed(2);
        delete balances[reverseKey];
      } else if (reverseAmount > forwardAmount) {
        simplified[`${to}_${from}`] = +(reverseAmount - forwardAmount).toFixed(2);
        delete balances[key];
      }
    }

    console.log('Simplified balances:', simplified); 

    const settlements = Object.entries(simplified).map(([key, amount]) => {
      const [from, to] = key.split('_');
      return { from, to, amount };
    });

    res.json(settlements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to calculate balances', error: err.message });
  }
});

// Get chart data for group
router.get('/:groupId/chart-data', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ group: req.params.groupId })
      .populate('paidBy')
      .populate('splitAmounts.user');

    const categoryData = {};
    const contributionData = {};
    const paidMap = {};
    const owedMap = {};

    for (const exp of expenses) {
      const payer = exp.paidBy.username;
      const title = exp.title;

      // Category chart
      categoryData[title] = (categoryData[title] || 0) + exp.amount;

      // Contribution chart
      contributionData[payer] = (contributionData[payer] || 0) + exp.amount;

      // Paid vs Owed
      paidMap[payer] = (paidMap[payer] || 0) + exp.amount;

      for (const split of exp.splitAmounts) {
        const username = split.user?.username;
        if (!username) continue;
        owedMap[username] = (owedMap[username] || 0) + split.amount;
      }
    }

    const allUsers = Array.from(new Set([...Object.keys(paidMap), ...Object.keys(owedMap)]));
    const paidData = allUsers.map((user) => paidMap[user] || 0);
    const owedData = allUsers.map((user) => owedMap[user] || 0);

    const colorPalette = [
      '#60A5FA', '#F87171', '#34D399', '#A78BFA', '#FBBF24', '#F472B6', '#4ADE80', '#818CF8'
    ];

    const paidOwedChart = {
      labels: allUsers,
      datasets: [
        {
          label: 'Paid',
          data: paidData,
          backgroundColor: '#60A5FA'
        },
        {
          label: 'Owed',
          data: owedData,
          backgroundColor: '#F87171'
        }
      ]
    };

    res.json({
      category: {
        labels: Object.keys(categoryData),
        datasets: [{
          label: '₹ Spent',
          data: Object.values(categoryData),
          backgroundColor: Object.keys(categoryData).map((_, i) => colorPalette[i % colorPalette.length])
        }]
      },
      contribution: {
        labels: Object.keys(contributionData),
        datasets: [{
          label: '₹ Paid',
          data: Object.values(contributionData),
          backgroundColor: Object.keys(contributionData).map((_, i) => colorPalette[i % colorPalette.length])
        }]
      },
      paidOwed: paidOwedChart
    });
  } catch (err) {
    console.error('Chart Data Error:', err);
    res.status(500).json({ message: 'Failed to get chart data' });
  }
});

// Delete group (only creator)
router.delete('/:groupId', auth, async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const group = await Group.findById(groupId);

    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.creator.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only creator can delete group' });
    }

    await Expense.deleteMany({ group: groupId });

    await Group.findByIdAndDelete(groupId);

    res.json({ message: 'Group and related expenses deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete group', error: err.message });
  }
});



module.exports = router;
