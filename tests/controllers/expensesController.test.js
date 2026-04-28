import { describe, it, expect, vi } from 'vitest';
import mongoose from 'mongoose';
import * as expensesController from '../../src/controllers/expensesController.js';
import * as expenseService from '../../src/services/expensesService.js';
import Group from '../../src/models/Group.js';
import User from '../../src/models/User.js';

vi.mock('../../src/services/expensesService.js');
vi.mock('../../src/models/Group.js');
vi.mock('../../src/models/User.js');

const mockRequest = (body = {}, params = {}) => ({
  body,
  params,
});

const mockResponse = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('Expenses Controller', () => {
  describe('create', () => {
    it('should create a personal expense successfully', async () => {
      const req = mockRequest({
        amount: 50,
        description: 'Dinner',
        type: 'personal',
        paidBy: '60c72b2f9b1d8c001f8e4d4b',
      });
      const res = mockResponse();
      const expense = { _id: 'expenseId', description: 'Dinner' };

      User.findById.mockResolvedValue({ _id: '60c72b2f9b1d8c001f8e4d4b' });
      expenseService.createExpense.mockResolvedValue(expense);

      await expensesController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'expense created', expense });
    });

    it('should create a group expense successfully', async () => {
        const userId1 = new mongoose.Types.ObjectId().toHexString();
        const userId2 = new mongoose.Types.ObjectId().toHexString();
        const gId = new mongoose.Types.ObjectId().toHexString();
        const req = mockRequest({
          amount: 100,
          description: 'Groceries',
          type: 'group',
          groupId: gId,
          paidBy: userId1,
          participants: [userId1, userId2],
        });
        const res = mockResponse();
        const expense = { _id: 'expenseId', description: 'Groceries' };
      
        User.findById.mockResolvedValue({ _id: userId1 });
        Group.findById.mockResolvedValue({ _id: gId, members: [userId1, userId2] });
        expenseService.createExpense.mockResolvedValue(expense);
      
        await expensesController.create(req, res);
      
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: 'expense created', expense });
      });

    it('should return 400 for invalid amount', async () => {
      const req = mockRequest({ amount: -10 });
      const res = mockResponse();

      await expensesController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'amount must be a positive number' });
    });
  });

  describe('listByGroup', () => {
    it('should return expenses for a group', async () => {
      const req = mockRequest({}, { groupId: '60c72b2f9b1d8c001f8e4d4b' });
      const res = mockResponse();
      const expenses = [{ description: 'Movie tickets' }];
      expenseService.getExpensesByGroup.mockResolvedValue(expenses);

      await expensesController.listByGroup(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'group expenses fetched', expenses });
    });
  });

  describe('listPersonal', () => {
    it('should return personal expenses for a user', async () => {
      const req = mockRequest({}, { userId: '60c72b2f9b1d8c001f8e4d4b' });
      const res = mockResponse();
      const expenses = [{ description: 'Coffee' }];
      expenseService.getPersonalExpensesByUser.mockResolvedValue(expenses);

      await expensesController.listPersonal(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'personal expenses fetched', expenses });
    });
  });

  describe('remove', () => {
    it('should remove an expense successfully', async () => {
      const req = mockRequest({}, { expenseId: '60c72b2f9b1d8c001f8e4d4b' });
      const res = mockResponse();
      expenseService.deleteExpenseById.mockResolvedValue({ deletedCount: 1 });

      await expensesController.remove(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'expense deleted' });
    });
  });
});
