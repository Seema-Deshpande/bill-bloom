import { describe, it, expect, vi } from 'vitest';
import * as groupsController from '../../src/controllers/groupsController.js';
import * as groupService from '../../src/services/groupsService.js';
import Expense from '../../src/models/Expense.js';

vi.mock('../../src/services/groupsService.js');
vi.mock('../../src/models/Expense.js');

const mockRequest = (body = {}, params = {}, user = {}) => ({
  body,
  params,
  user,
});

const mockResponse = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('Groups Controller', () => {
  describe('create', () => {
    it('should create a group successfully', async () => {
      const req = mockRequest({ name: 'New Group', memberIds: ['1', '2'] }, {}, { id: '1' });
      const res = mockResponse();
      const group = { _id: 'groupId', name: 'New Group' };
      groupService.createGroup.mockResolvedValue(group);

      await groupsController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'group created', group });
    });

    it('should return 400 if name or memberIds are missing', async () => {
      const req = mockRequest({}, {}, { id: '1' });
      const res = mockResponse();

      await groupsController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'name and memberIds are required' });
    });
  });

  describe('list', () => {
    it('should return a list of all groups', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const groups = [{ name: 'Group 1' }, { name: 'Group 2' }];
      groupService.getAllGroups.mockResolvedValue(groups);

      await groupsController.list(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'all groups fetched', groups });
    });
  });

  describe('details', () => {
    it('should return group details and expenses', async () => {
        const req = mockRequest({}, { id: '60c72b2f9b1d8c001f8e4d4b' });
        const res = mockResponse();
        const group = { _id: '60c72b2f9b1d8c001f8e4d4b', name: 'Test Group' };
        const expenses = [{ description: 'Lunch' }];
      
        groupService.getGroupById.mockResolvedValue(group);
        
        // Mock the chained methods for the Expense query
        // The controller awaits the chain directly (no .exec()), so we need a thenable
        const chainable = {
          select: vi.fn().mockReturnThis(),
          populate: vi.fn().mockReturnThis(),
          then: vi.fn((resolve) => resolve(expenses)),
        };
        Expense.find.mockReturnValue(chainable);
      
        await groupsController.details(req, res);
      
        expect(res.json).toHaveBeenCalledWith({ message: 'group details fetched', group, expenses });
      });

    it('should return 404 if group not found', async () => {
      const req = mockRequest({}, { id: '60c72b2f9b1d8c001f8e4d4b' });
      const res = mockResponse();
      groupService.getGroupById.mockResolvedValue(null);

      await groupsController.details(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'group not found' });
    });
  });

  describe('update', () => {
    it('should update a group successfully', async () => {
      const req = mockRequest({ name: 'Updated Name' }, { id: '60c72b2f9b1d8c001f8e4d4b' });
      const res = mockResponse();
      const updatedGroup = { _id: '60c72b2f9b1d8c001f8e4d4b', name: 'Updated Name' };
      groupService.updateGroup.mockResolvedValue(updatedGroup);

      await groupsController.update(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'group updated', group: updatedGroup });
    });
  });

  describe('remove', () => {
    it('should remove a group successfully', async () => {
      const req = mockRequest({}, { id: '60c72b2f9b1d8c001f8e4d4b' });
      const res = mockResponse();
      groupService.deleteGroup.mockResolvedValue({ deletedCount: 1 });

      await groupsController.remove(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'group deleted' });
    });
  });
});
