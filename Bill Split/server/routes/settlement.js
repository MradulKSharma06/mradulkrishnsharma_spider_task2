const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const SettlementRequest = require('../models/SettlementRequest');
const Group = require('../models/Group');
const Expense = require('../models/Expense');
const User = require('../models/User');

// POST /settlement/request
router.post('/request', auth, async (req, res) => {
  const { groupId, to, amount, referenceId, note } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (!group.members.includes(req.userId) || !group.members.includes(to)) {
      return res.status(403).json({ message: 'Users must be in the same group' });
    }

    const newRequest = new SettlementRequest({
      group: groupId,
      from: req.userId,
      to,
      amount,
      referenceId,
      note
    });

    await newRequest.save();
    res.json({ message: 'Settlement request sent' });
  } catch (err) {
    console.error('Error creating settlement:', err);
    res.status(500).json({ message: 'Failed to send request' });
  }
});

// GET /settlement/requests
router.get('/requests', auth, async (req, res) => {
  try {
    const requests = await SettlementRequest.find({ to: req.userId, status: 'pending' })
      .populate('from', 'username')
      .populate('group', 'name');

    res.json(requests);
  } catch (err) {
    console.error('Error fetching requests:', err);
    res.status(500).json({ message: 'Failed to fetch requests' });
  }
});

// POST /settlement/respond
router.post('/respond', auth, async (req, res) => {
  const { requestId, action } = req.body;

  try {
    const request = await SettlementRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.to.toString() !== req.userId)
      return res.status(403).json({ message: 'Not authorized to respond to this request' });

    if (request.status !== 'pending')
      return res.status(400).json({ message: 'Request already processed' });

    if (action === 'approve') {
      request.status = 'approved';
      await request.save();
      await updateBalances(request.group, request.from, request.to, request.amount);
      return res.json({ message: 'Request approved and balance updated' });
    } else if (action === 'reject') {
      request.status = 'rejected';
      await request.save();
      return res.json({ message: 'Request rejected' });
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }
  } catch (err) {
    console.error('Error responding to request:', err);
    res.status(500).json({ message: 'Failed to respond' });
  }
});

// Balance adjustment helper
async function updateBalances(groupId, fromId, toId, amount) {
  const expenses = await Expense.find({ group: groupId });

  for (const exp of expenses) {
    let updated = false;

    for (let payment of exp.payments) {
      if (
        payment.from.toString() === fromId &&
        payment.to.toString() === toId &&
        payment.amount > 0
      ) {
        const deduction = Math.min(amount, payment.amount);
        payment.amount -= deduction;
        amount -= deduction;
        updated = true;

        if (amount <= 0) break;
      }
    }

    if (updated) await exp.save();
    if (amount <= 0) break;
  }
}

module.exports = router;
