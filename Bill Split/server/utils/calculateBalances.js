function calculateNetBalances(group, expenses) {
  const balances = {};
  const memberIds = group.members.map(id => id.toString());

  memberIds.forEach(id1 => {
    balances[id1] = {};
    memberIds.forEach(id2 => {
      balances[id1][id2] = 0;
    });
  });

  expenses.forEach(exp => {
    const paidBy = exp.paidBy.toString();
    exp.splitAmounts.forEach(split => {
      const userId = split.user.toString();
      if (userId !== paidBy) {
        balances[userId][paidBy] += split.amount;
      }
    });
  });

  const simplified = [];
  const visited = new Set();

  memberIds.forEach(a => {
    memberIds.forEach(b => {
      if (a === b) return;
      const key = [a, b].sort().join('_');
      if (visited.has(key)) return;

      const net = balances[a][b] - balances[b][a];
      if (net > 0) {
        simplified.push({ from: a, to: b, amount: +net.toFixed(2) });
      } else if (net < 0) {
        simplified.push({ from: b, to: a, amount: +(-net).toFixed(2) });
      }

      visited.add(key);
    });
  });

  return simplified;
}

module.exports = calculateNetBalances;
