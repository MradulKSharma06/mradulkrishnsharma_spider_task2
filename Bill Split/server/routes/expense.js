const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Group = require('../models/Group');
const verifyToken = require('../middleware/auth');
const calculateNetBalances = require('../utils/calculateBalances');
const auth = require('../middleware/auth.js')

// Add an expense to a group
router.post('/:groupId', verifyToken, async (req, res) => {
  const { groupId } = req.params;
  const { title, paidBy, amount, members, splitAmounts } = req.body;

  if (!title || !paidBy || !amount || !members || !splitAmounts) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.members.includes(req.userId)) return res.status(403).json({ message: 'Not a group member' });

    if (!group.members.includes(paidBy)) return res.status(400).json({ message: 'Payer must be a group member' });
    for (const memberId of members) {
      if (!group.members.includes(memberId)) {
        return res.status(400).json({ message: 'All split members must be group members' });
      }
    }

    let totalSplit = 0;
    for (const split of splitAmounts) {
      if (!group.members.includes(split.user)) {
        return res.status(400).json({ message: 'Split amounts users must be group members' });
      }
      totalSplit += split.amount;
    }
    if (totalSplit !== amount) {
      return res.status(400).json({ message: 'Split amounts must sum to total amount' });
    }

    const expense = new Expense({
      group: groupId,
      title,
      paidBy,
      amount,
      members,
      splitAmounts
    });

    await expense.save();
    res.status(201).json(expense);

  } catch (err) {
    res.status(500).json({ message: 'Failed to add expense', error: err.message });
  }
});

// Get all expenses for a group
router.get('/:groupId', verifyToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.members.includes(req.userId)) return res.status(403).json({ message: 'Not a group member' });

    const expenses = await Expense.find({ group: req.params.groupId })
      .populate('paidBy', 'username email')
      .populate('members', 'username email')
      .populate('splitAmounts.user', 'username email')
      .sort({ createdAt: -1 });

    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch expenses', error: err.message });
  }
});

// Delete an expense by ID (only creator can delete)
router.delete('/:expenseId', verifyToken, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.expenseId);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    if (expense.paidBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this expense' });
    }

    await Expense.findByIdAndDelete(req.params.expenseId);
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete expense', error: err.message });
  }
});

// Get balances owed by current user in a group
router.get('/:groupId/balances', verifyToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (!group.members.includes(req.userId)) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    const expenses = await Expense.find({ group: req.params.groupId });

    const simplifiedBalances = calculateNetBalances(group, expenses);

    // Filter to only show debts where current user owes someone
    const userOnly = simplifiedBalances.filter(b => b.from === req.userId);

    res.json(userOnly);
  } catch (err) {
    res.status(500).json({ message: 'Failed to compute balances', error: err.message });
  }
});

// Get chart data for group
router.get('/:groupId/chart-data', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ group: req.params.groupId })
      .populate('paidBy')
      .populate('splitAmounts.user');

    const categoryTotals = {};
    const contributionTotals = {};
    const paidMap = {};
    const owedMap = {};

    expenses.forEach(exp => {
      const title = exp.title;
      const payerUsername = exp.paidBy?.username || 'Unknown';

      // Category-wise expenses
      categoryTotals[title] = (categoryTotals[title] || 0) + exp.amount;

      // Contribution (who paid)
      contributionTotals[payerUsername] = (contributionTotals[payerUsername] || 0) + exp.amount;

      // Paid map (for comparison)
      paidMap[payerUsername] = (paidMap[payerUsername] || 0) + exp.amount;

      // Owed map (sum of splitAmounts)
      exp.splitAmounts.forEach(split => {
        const username = split.user?.username;
        if (!username) return;
        owedMap[username] = (owedMap[username] || 0) + split.amount;
      });
    });

    const allUsers = Array.from(new Set([...Object.keys(paidMap), ...Object.keys(owedMap)]));
    const paidData = allUsers.map(user => paidMap[user] || 0);
    const owedData = allUsers.map(user => owedMap[user] || 0);

    const colorPalette = [
      '#8b69c2', // Primary Purple
      '#dea584', // Muted Peach
      '#ba93ea', // Lavender
      '#5eead4', // Teal
      '#fca5a5', // Soft Red
      '#c0b9bb', // Muted Grey-Pink
      '#a5b4fc', // Indigo
      '#facc15'  // Yellow
    ];

    const responseData = {
      category: {
        labels: Object.keys(categoryTotals),
        datasets: [{
          label: '₹ Spent',
          data: Object.values(categoryTotals),
          backgroundColor: Object.keys(categoryTotals).map((_, i) => colorPalette[i % colorPalette.length])
        }]
      },
      contribution: {
        labels: Object.keys(contributionTotals),
        datasets: [{
          label: '₹ Paid',
          data: Object.values(contributionTotals),
          backgroundColor: Object.keys(contributionTotals).map((_, i) => colorPalette[i % colorPalette.length])
        }]
      },
      paidOwed: {
        labels: allUsers,
        datasets: [
          {
            label: 'Paid',
            data: paidData,
            backgroundColor: '#8b69c2'
          },
          {
            label: 'Owed',
            data: owedData,
            backgroundColor: '#fca5a5'
          }
        ]
      }
    };

    res.json(responseData);
  } catch (err) {
    console.error('Chart Data Error:', err.message || err);
    res.status(500).json({ message: 'Failed to get chart data' });
  }
});

module.exports = router;
