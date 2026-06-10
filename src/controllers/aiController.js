import { body, validationResult } from 'express-validator';
import Group from '../models/Group.js';
import { parseExpenseFromText, analyzePersonalExpenses, scanBillImage } from '../services/aiService.js';
import { getCategoryTotalsForUser } from '../services/analyticsService.js';

// ─── Validation chains (attached to routes) ───────────────────────────────────

export const parseExpenseValidation = [
    body('text')
        .isString().withMessage('text must be a string')
        .trim()
        .notEmpty().withMessage('text is required')
        .isLength({ max: 1000 }).withMessage('text must be 1000 characters or fewer'),
    body('groupId')
        .optional()
        .isMongoId().withMessage('groupId must be a valid id'),
];

export const scanBillValidation = [
    body('image')
        .isString().withMessage('image must be a base64 string')
        .notEmpty().withMessage('image is required'),
    body('mimeType')
        .optional()
        .isIn(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
        .withMessage('mimeType must be one of: image/jpeg, image/png, image/webp, image/gif'),
];

// ─── Helper ───────────────────────────────────────────────────────────────────

const handleValidation = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).json({ message: 'Validation failed', errors: errors.array() });
        return false;
    }
    return true;
};

// ─── Controllers ──────────────────────────────────────────────────────────────

// POST /api/ai/parse-expense
// Body: { text: string, groupId?: string }
export const parseExpense = async (req, res, next) => {
    if (!handleValidation(req, res)) return;
    try {
        const { text, groupId } = req.body;

        let members = [];
        if (groupId) {
            const group = await Group.findById(groupId).populate('members', 'username _id');
            if (!group) return res.status(404).json({ message: 'group not found' });
            members = group.members.filter(m => String(m._id) !== String(req.user._id));
        }

        const result = await parseExpenseFromText(text.trim(), req.user, members);
        return res.json({ message: 'expense parsed', data: result });
    } catch (err) {
        next(err);
    }
};

// POST /api/ai/analyse-personal
// No body — analyses the logged-in user's personal expenses
export const analysePersonal = async (req, res, next) => {
    try {
        const categoryTotals = await getCategoryTotalsForUser(req.user._id);

        if (!categoryTotals.length) {
            return res.json({
                message: 'expense analysis',
                data: {
                    summary: 'No personal expenses recorded yet. Start logging your expenses to get personalised insights!',
                },
            });
        }

        const totalSpent =
            Math.round(categoryTotals.reduce((sum, c) => sum + c.total, 0) * 100) / 100;

        const sorted = [...categoryTotals].sort((a, b) => b.total - a.total);
        const highestCategory = sorted[0];
        const lowestCategory = sorted[sorted.length - 1];

        const summary = await analyzePersonalExpenses({
            totalSpent,
            categoryTotals,
            highestCategory,
            lowestCategory,
        });

        return res.json({
            message: 'expense analysis',
            data: { totalSpent, highestCategory, lowestCategory, categoryTotals, summary },
        });
    } catch (err) {
        next(err);
    }
};

// POST /api/ai/scan-bill
// Body: { image: string (base64), mimeType?: string }
export const scanBill = async (req, res, next) => {
    if (!handleValidation(req, res)) return;
    try {
        const { image, mimeType } = req.body;
        const result = await scanBillImage(image, mimeType || 'image/jpeg');
        return res.json({ message: 'bill scanned', data: result });
    } catch (err) {
        next(err);
    }
};
