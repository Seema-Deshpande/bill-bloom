import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../app.js';
import User from '../src/models/User.js';
import Group from '../src/models/Group.js';
import Expense from '../src/models/Expense.js';

let mongoServer;
let token;
let userId;
let groupId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);
  const user = await User.create({
    username: 'expenseuser',
    email: 'expense@example.com',
    password: hashedPassword,
  });
  userId = user._id.toString();

  const group = await Group.create({
    name: 'Expense Group',
    createdBy: userId,
    members: [userId],
  });
  groupId = group._id.toString();

  token = jwt.sign({ id: userId, username: 'expenseuser' }, 'your_jwt_secret', { expiresIn: '1h' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Expense.deleteMany({});
});

describe('Expenses API', () => {
  describe('POST /api/expenses', () => {
    it('should create a new personal expense', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'Test Expense',
          amount: 100,
          type: 'personal',
          paidBy: userId,
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'expense created');
    });

    it('should return 400 for invalid amount', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'Bad Expense',
          amount: -5,
          type: 'personal',
          paidBy: userId,
        });

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('GET /api/expenses/group/:groupId', () => {
    it('should get expenses for a group', async () => {
      await Expense.create({
        description: 'Group Expense',
        amount: 50,
        type: 'group',
        groupId: groupId,
        paidBy: userId,
        participants: [userId],
      });

      const res = await request(app)
        .get(`/api/expenses/group/${groupId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.expenses).toBeInstanceOf(Array);
      expect(res.body.expenses.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/expenses/personal/:userId', () => {
    it('should get personal expenses for a user', async () => {
      await Expense.create({
        description: 'Personal Expense',
        amount: 25,
        type: 'personal',
        paidBy: userId,
      });

      const res = await request(app)
        .get(`/api/expenses/personal/${userId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.expenses).toBeInstanceOf(Array);
      expect(res.body.expenses.length).toBeGreaterThan(0);
    });
  });

  describe('DELETE /api/expenses/:expenseId', () => {
    it('should delete an expense', async () => {
      const expense = await Expense.create({
        description: 'To Be Deleted',
        amount: 10,
        type: 'personal',
        paidBy: userId,
      });

      const res = await request(app)
        .delete(`/api/expenses/${expense._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'expense deleted');
    });
  });
});
