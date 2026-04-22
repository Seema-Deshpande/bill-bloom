import mongoose from 'mongoose';
import * as settlementService from '../services/settlementsService.js';
import User from '../models/User.js';
import Group from '../models/Group.js';

const isValidId = (id) => mongoose.isValidObjectId(id);

export const create = async (req, res) => {
  const { fromUser, toUser, amount, groupId, note } = req.body;

  if (!fromUser || !toUser || amount == null) {
    return res.status(400).json({ message: 'fromUser, toUser and amount are required' });
  }
  if (!isValidId(fromUser) || !isValidId(toUser)) {
    return res.status(400).json({ message: 'fromUser and toUser must be valid ids' });
  }
  if (fromUser === toUser) {
    return res.status(400).json({ message: 'fromUser and toUser cannot be the same' });
  }
  const amt = Number(amount);
  if (isNaN(amt) || amt <= 0) {
    return res.status(400).json({ message: 'amount must be a positive number' });
  }

  try {
    const [from, to] = await Promise.all([User.findById(fromUser), User.findById(toUser)]);
    if (!from || !to) return res.status(404).json({ message: 'fromUser or toUser not found' });

    if (groupId) {
      if (!isValidId(groupId)) return res.status(400).json({ message: 'invalid groupId' });
      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ message: 'group not found' });
      // optional: ensure both users are group members
      const members = group.members.map(String);
      if (!members.includes(String(fromUser)) || !members.includes(String(toUser))) {
        return res.status(400).json({ message: 'both users must be members of the group' });
      }
    }

    const settlement = await settlementService.createSettlement({
      fromUser,
      toUser,
      amount: amt,
      groupId,
      note
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