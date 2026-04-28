import Expense from '../models/Expense.js';
import { calculateSettlements } from '../utils/settlementEngine.js';
import Settlement from '../models/Settlement.js';
import Expense from '../models/Expense.js';
import { calculateSettlements } from '../utils/settlementEngine.js';

export const createSettlement = (data) => {
  const { fromUser, toUser, amount, groupId } = data;
  const s = new Settlement({
    from: fromUser,
    to: toUser,
    amount,
    group: groupId
  });
  return s.save();
};

export const getSettlementsByGroup = async (groupId) => {
  const settlements = await Settlement.find({ group: groupId })
    .populate('from', 'name')
    .populate('to', 'name');
  
  return settlements.map(s => ({
      fromId: s.from._id,
      fromName: s.from.name,
      toId: s.to._id,
      toName: s.to.name,
      amount: s.amount
  }));
};

export const settleGroupExpenses = async (groupId) => {
    const expenses = await Expense.find({ group: groupId }).populate('paidBy').populate('splits.user');
    if (!expenses.length) {
        return [];
    }
    const settlements = calculateSettlements(expenses);
    return settlements;
};