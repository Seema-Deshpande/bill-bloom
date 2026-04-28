import Group from '../models/Group.js';

const isGroupCreator = async (req, res, next) => {
  try {
    const groupId = req.params.id || req.params.groupId;
    const userId = req.user.id;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'User is not the creator of this group' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export default isGroupCreator;
