import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../app.js';
import User from '../src/models/User.js';
import Group from '../src/models/Group.js';
import bcrypt from 'bcryptjs';

let mongoServer;
let token;
let userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);
  const user = await User.create({
    username: 'testuser',
    email: 'test@example.com',
    password: hashedPassword,
  });
  userId = user._id.toString();

  // Sign token with same secret the auth middleware uses
  token = jwt.sign({ id: userId, username: 'testuser' }, 'your_jwt_secret', { expiresIn: '1h' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Group.deleteMany({});
});

describe('Groups API', () => {
  describe('POST /api/groups', () => {
    it('should create a new group', async () => {
      const otherUser = await User.create({ username: 'other', email: 'other@test.com', password: 'hashed' });
      const res = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test Group', memberIds: [userId, otherUser._id.toString()] });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'group created');
      expect(res.body.group).toHaveProperty('name', 'Test Group');
    });

    it('should return 400 for missing group name', async () => {
      const res = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${token}`)
        .send({ memberIds: [userId] });

      expect(res.statusCode).toEqual(400);
    });

    it('should return 401 without auth token', async () => {
      const res = await request(app)
        .post('/api/groups')
        .send({ name: 'No Auth Group', memberIds: [userId] });

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/groups', () => {
    it('should return a list of groups', async () => {
      await Group.create({ name: 'Group 1', createdBy: userId, members: [userId] });

      const res = await request(app)
        .get('/api/groups')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('groups');
    });
  });

  describe('GET /api/groups/:id', () => {
    it('should return group details', async () => {
      const group = await Group.create({ name: 'Detail Group', createdBy: userId, members: [userId] });
      const res = await request(app)
        .get(`/api/groups/${group._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.group).toHaveProperty('name', 'Detail Group');
    });

    it('should return 404 for non-existent group', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/groups/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(404);
    });
  });

  describe('PUT /api/groups/:id', () => {
    it('should update a group', async () => {
      const group = await Group.create({ name: 'Old Name', createdBy: userId, members: [userId] });
      const res = await request(app)
        .put(`/api/groups/${group._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Name' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.group).toHaveProperty('name', 'New Name');
    });
  });

  describe('DELETE /api/groups/:id', () => {
    it('should delete a group', async () => {
      const group = await Group.create({ name: 'To Delete', createdBy: userId, members: [userId] });
      const res = await request(app)
        .delete(`/api/groups/${group._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'group deleted');
    });
  });
});
