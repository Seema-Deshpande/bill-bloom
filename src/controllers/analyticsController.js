import * as analyticsService from '../services/analyticsService.js';

export const getPersonalAnalytics = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const analytics = await analyticsService.getPersonalAnalytics(userId);
        res.json(analytics);
    } catch (error) {
        next(error);
    }
};

export const getGroupAnalytics = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const analytics = await analyticsService.getGroupAnalytics(userId);
        res.json(analytics);
    } catch (error) {
        next(error);
    }
};

export const getCategoryBasedAnalytics = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const analytics = await analyticsService.getCategoryBasedAnalytics(userId);
        res.json(analytics);
    } catch (error) {
        next(error);
    }
};
