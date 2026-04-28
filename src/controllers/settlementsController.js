import mongoose from 'mongoose';
import * as settlementService from '../services/settlementsService.js';
import User from '../models/User.js';
import Group from '../models/Group.js';

const isValidId = (id) => mongoose.isValidObjectId(id);

export const create = async (req, res) => {
  const { fromId, toId, amount, groupID } = req.body;

  if (!fromId || !toId || amount == null) {
    return res.status(400).json({ message: 'fromId, toId and amount are required' });
  }
  if (!isValidId(fromId) || !isValidId(toId)) {
    return res.status(400).json({ message: 'fromId and toId must be valid ids' });
  }
  if (fromId === toId) {
    return res.status(400).json({ message: 'fromId and toId cannot be the same' });
  }
  const amt = Number(amount);
  if (isNaN(amt) || amt <= 0) {
    return res.status(400).json({ message: 'amount must be a positive number' });
  }

  try {
    const [from, to] = await Promise.all([User.findById(fromId), User.findById(toId)]);
    if (!from || !to) return res.status(404).json({ message: 'fromId or toId not found' });

    if (groupID) {
      if (!isValidId(groupID)) return res.status(400).json({ message: 'invalid groupID' });
      const group = await Group.findById(groupID);
      if (!group) return res.status(404).json({ message: 'group not found' });
      // optional: ensure both users are group members
      const members = group.members.map(String);
      if (!members.includes(String(fromId)) || !members.includes(String(toId))) {
        return res.status(400).json({ message: 'both users must be members of the group' });
      }
    }

    const settlement = await settlementService.createSettlement({
      fromUser: fromId,
      toUser: toId,
      amount: amt,
      groupId: groupID,
    });

    return res.status(201).json({ message: 'settlement created', settlement });
  } catch (err) {
    console.error('Settlement create error:', err);
    return res.status(500).json({ message: 'server error' });
  }
};

export const listByGroup = async (req, res) => {
  const { groupId } = req.params;
  if (!isValidId(groupId)) return res.status(400).json({ message: 'invalid group id' });

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'group not found' });

    const settlements = await settlementService.getSettlementsByGroup(groupId);
    return res.json({ message: 'group settlements fetched', settlements });
  } catch (err) {
    console.error('Settlement list error:', err);
    return res.status(500).json({ message: 'server error' });
  }
};

export const settleGroupExpenses = async (req, res) => {
  const { groupId } = req.params;
  if (!isValidId(groupId)) return res.status(400).json({ message: 'invalid group id' });

  try {
    const settlements = await settlementService.settleGroupExpenses(groupId);
    return res.json({ message: 'group settlements calculated', settlements });
  } catch (err) {
    console.error('Settlement calculation error:', err);
    return res.status(500).json({ message: 'server error' });
  }
};