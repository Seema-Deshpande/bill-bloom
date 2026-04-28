import User from '../models/User.js';

export const searchUsers = async (query) => {
    const users = await User.find({
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
        ]
    });
    return users;
};
