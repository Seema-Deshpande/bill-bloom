const calculateSettlements = (expenses) => {
  const balances = new Map();

  expenses.forEach(expense => {
    const { amount, paidBy, splits } = expense;
    
    if (!balances.has(paidBy._id.toString())) {
      balances.set(paidBy._id.toString(), 0);
    }
    balances.set(paidBy._id.toString(), balances.get(paidBy._id.toString()) + amount);

    splits.forEach(split => {
      const memberId = split.user._id.toString();
      if (!balances.has(memberId)) {
        balances.set(memberId, 0);
      }
      balances.set(memberId, balances.get(memberId) - split.amount);
    });
  });

  const debtors = [];
  const creditors = [];

  balances.forEach((balance, userId) => {
    if (balance > 0) {
      creditors.push({ userId, amount: balance });
    } else if (balance < 0) {
      debtors.push({ userId, amount: -balance });
    }
  });

  const settlements = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const settleAmount = Math.min(debtor.amount, creditor.amount);

    settlements.push({
      from: debtor.userId,
      to: creditor.userId,
      amount: settleAmount,
    });

    debtor.amount -= settleAmount;
    creditor.amount -= settleAmount;

    if (debtor.amount === 0) {
      debtorIndex++;
    }
    if (creditor.amount === 0) {
      creditorIndex++;
    }
  }

  return settlements;
};

module.exports = {
  calculateSettlements,
};
