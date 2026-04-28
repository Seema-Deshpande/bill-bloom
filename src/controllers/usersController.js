import * as usersService from '../services/usersService.js';

export const searchUsers = async (req, res, next) => {
    try {
        const { q } = req.query;
        const users = await usersService.searchUsers(q);
        res.json(users);
    } catch (error) {
        next(error);
    }
};
