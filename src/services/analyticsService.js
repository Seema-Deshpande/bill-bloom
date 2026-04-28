import Expense from '../models/Expense.js';
import Group from '../models/Group.js';
import mongoose from 'mongoose';

export const getPersonalAnalytics = async (userId) => {
    const monthlySpending = await Expense.aggregate([
        { $match: { 'splits.user': new mongoose.Types.ObjectId(userId) } },
        { $unwind: '$splits' },
        { $match: { 'splits.user': new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: { year: { $year: '$date' }, month: { $month: '$date' } },
                total: { $sum: '$splits.amount' }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    return monthlySpending;
};

export const getGroupAnalytics = async (userId) => {
    const groupExpenses = await Expense.aggregate([
        { $match: { 'splits.user': new mongoose.Types.ObjectId(userId) } },
        { $unwind: '$splits' },
        { $match: { 'splits.user': new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: '$group',
                total: { $sum: '$splits.amount' }
            }
        },
        {
            $lookup: {
                from: 'groups',
                localField: '_id',
                foreignField: '_id',
                as: 'group'
            }
        },
        { $unwind: '$group' },
        {
            $project: {
                groupId: '$_id',
                groupName: '$group.name',
                total: 1,
                _id: 0
            }
        }
    ]);
    return groupExpenses;
};

export const getCategoryBasedAnalytics = async (userId) => {
    const categorySpending = await Expense.aggregate([
        { $match: { 'splits.user': new mongoose.Types.ObjectId(userId) } },
        { $unwind: '$splits' },
        { $match: { 'splits.user': new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: '$category',
                total: { $sum: '$splits.amount' }
            }
        },
        {
            $project: {
                category: '$_id',
                total: 1,
                _id: 0
            }
        }
    ]);
    return categorySpending;
};
