import mongoose from 'mongoose';
import * as groupService from '../services/groupsService.js';
import Expense from '../models/Expense.js';

const isValidId = (id) => mongoose.isValidObjectId(id);

export const create = async (req, res) => {
  const { name, memberIds } = req.body;
  const createdBy = req.user.id;

  if (!name || !memberIds) {
    return res.status(400).json({ message: 'name and memberIds are required' });
  }
  if (!Array.isArray(memberIds)) {
    return res.status(400).json({ message: 'memberIds must be an array' });
  }
  
  // Ensure the creator is a member of the group
  if (!memberIds.includes(createdBy)) {
    memberIds.push(createdBy);
  }

  if (memberIds.length < 2) {
    return res.status(400).json({ message: 'a group must have at least 2 members' });
  }
  try {
    const group = await groupService.createGroup({ name, memberIds, createdBy });
    return res.status(201).json({ message: 'group created', group });
  } catch (err) {
    return res.status(400).json({ message: err.message || 'failed to create group' });
  }
};

export const list = async (req, res) => {
  try {
    const groups = await groupService.getAllGroups();
    return res.json({ message: 'all groups fetched', groups });
  } catch (err) {
    return res.status(500).json({ message: 'server error' });
  }
};

export const details = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: 'invalid group id' });
  try {
    const group = await groupService.getGroupById(id);
    if (!group) return res.status(404).json({ message: 'group not found' });

    // fetch expenses for this group
    const expenses = await Expense.find({ groupId: id })
      .select('amount description type groupId paidBy participants date createdAt')
      .populate('paidBy', 'username email')
      .populate('participants', 'username email');

    return res.json({ message: 'group details fetched', group, expenses });
  } catch (err) {
    return res.status(500).json({ message: 'server error' });
  }
};

export const update = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: 'invalid group id' });

  const { name, addMemberIds } = req.body;
  if (!name && (!addMemberIds || addMemberIds.length === 0)) {
    return res.status(400).json({ message: 'nothing to update' });
  }

  try {
    const updated = await groupService.updateGroup(id, { name, addMemberIds });
    if (!updated) return res.status(404).json({ message: 'group not found' });
    return res.json({ message: 'group updated', group: updated });
  } catch (err) {
    return res.status(400).json({ message: err.message || 'failed to update group' });
  }
};

export const remove = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: 'invalid group id' });
  try {
    const deleted = await groupService.deleteGroup(id);
    if (!deleted) return res.status(404).json({ message: 'group not found' });
    return res.json({ message: 'group deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'server error' });
  }
};