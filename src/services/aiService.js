import { generateAIContent, generateAIContentWithImage, suggestCategoryByKeyword, VALID_CATEGORIES, extractJSONFromAIResponse } from '../utils/geminiAIHelper.js';

const buildParsePrompt = (text, currentUser, members, todayISO) => {
    const memberList = members.map(m => m.username).join(', ');

    return `You are a bill-splitting assistant. Parse the following expense description into a JSON object.

Today's date: ${todayISO}
Current user: "${currentUser.username}"
Known participants (group members): ${memberList || 'none'}

Rules:
- "I", "me", "my" always refer to the current user: "${currentUser.username}"
- "amount" must be a positive number. Extract it from the text (e.g. "$45", "45 dollars", "45").
- "category" must be one of: ${VALID_CATEGORIES.join(', ')}. Infer from context.
- "description" is a short summary of what the expense is for.
- "payer" is the username of the person who paid. Defaults to "${currentUser.username}" if not mentioned.
- "participants" is an array of usernames who share this expense. Always include the payer. If no one is mentioned, default to ["${currentUser.username}"].
- "date" must be in YYYY-MM-DD format. If not mentioned, use today: ${todayISO}.

Expense description: "${text}"

Respond ONLY with a valid JSON object. No explanation, no markdown, no code fences.
Example output:
{"amount":45.50,"category":"Food","description":"dinner at restaurant","payer":"alice","participants":["alice","bob"],"date":"2024-06-10"}`;
};

const resolveUsername = (name, currentUser, members) => {
    const lower = name.toLowerCase();
    if (lower === currentUser.username.toLowerCase()) return currentUser._id.toString();
    const match = members.find(m => m.username.toLowerCase() === lower);
    return match ? match._id.toString() : null;
};

const applyConstraints = (parsed, currentUser, members) => {
    const today = new Date().toISOString().split('T')[0];

    // Resolve payer
    const payerName = parsed.payer || currentUser.username;
    const payerId = resolveUsername(payerName, currentUser, members) || currentUser._id.toString();

    // Resolve participants
    let participantIds = [];
    if (Array.isArray(parsed.participants) && parsed.participants.length > 0) {
        participantIds = parsed.participants
            .map(name => resolveUsername(name, currentUser, members))
            .filter(Boolean);
    }

    // Ensure payer is always in participants
    if (!participantIds.includes(payerId)) {
        participantIds.unshift(payerId);
    }

    // Default to current user if participants list is still empty
    if (participantIds.length === 0) {
        participantIds = [currentUser._id.toString()];
    }

    // Validate and fallback date
    const date = parsed.date && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date)
        ? parsed.date
        : today;

    // Validate category
    const category = VALID_CATEGORIES.includes(parsed.category) ? parsed.category : 'Misc';

    return {
        amount: Number(parsed.amount),
        category,
        description: parsed.description || '',
        payer: payerId,
        participants: participantIds,
        date,
    };
};

export const parseExpenseFromText = async (text, currentUser, members = []) => {
    const todayISO = new Date().toISOString().split('T')[0];
    const prompt = buildParsePrompt(text, currentUser, members, todayISO);

    try {
        const rawText = await generateAIContent(prompt);
        const parsed = extractJSONFromAIResponse(rawText);

        if (!parsed.amount || isNaN(Number(parsed.amount))) {
            throw new Error('AI returned invalid or missing amount');
        }

        return applyConstraints(parsed, currentUser, members);
    } catch {
        // Fallback: derive category from keyword matching, payer = current user
        return {
            amount: null,
            category: suggestCategoryByKeyword(text),
            description: text,
            payer: currentUser._id.toString(),
            participants: [currentUser._id.toString()],
            date: todayISO,
        };
    }
};

// ─── Personal Expense Analysis ───────────────────────────────────────────────

export const analyzePersonalExpenses = async (preComputedData) => {
    const { totalSpent, categoryTotals, highestCategory, lowestCategory } = preComputedData;

    const categoryLines = categoryTotals
        .map(c => `  ${c.category}: $${c.total}`)
        .join('\n');

    const prompt = `You are a friendly personal finance assistant. Here are a user's pre-computed expense statistics — do NOT recalculate any numbers.

Total spent: $${totalSpent}
Highest spending category: ${highestCategory.category} ($${highestCategory.total})
Lowest spending category: ${lowestCategory.category} ($${lowestCategory.total})
Breakdown by category:
${categoryLines}

Write a 3-4 sentence personal finance summary for this user. Use only the numbers provided above.
Include: one observation about their spending pattern, one practical suggestion to save or spend smarter, and one short encouragement.
Keep the tone warm, concise, and conversational. Output plain text only — no bullet points, no headers.`;

    const summary = await generateAIContent(prompt);
    return summary.trim();
};

// ─── Bill Image Scanning ──────────────────────────────────────────────────────

export const scanBillImage = async (base64Image, mimeType = 'image/jpeg') => {
    const todayISO = new Date().toISOString().split('T')[0];

    const prompt = `You are a receipt scanner. Extract the following from this bill or receipt image:
- total amount (numeric value, no currency symbol)
- description (the merchant name or a brief description of the purchase)
- date in YYYY-MM-DD format (use null if not visible)

Respond ONLY with a valid JSON object. No explanation, no markdown, no code fences.
Example: {"amount":42.75,"description":"Starbucks","date":"2024-06-10"}`;

    try {
        const rawText = await generateAIContentWithImage(prompt, base64Image, mimeType);
        const parsed = extractJSONFromAIResponse(rawText);

        const amount = Number(parsed.amount);
        if (!amount || isNaN(amount)) throw new Error('Could not extract amount from image');

        const date = parsed.date && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date)
            ? parsed.date
            : todayISO;

        return {
            amount,
            description: parsed.description || 'Scanned bill',
            date,
            sentence: `Scanned bill: $${amount.toFixed(2)} for "${parsed.description || 'purchase'}" on ${date}.`,
        };
    } catch {
        return {
            amount: null,
            description: null,
            date: todayISO,
            sentence: 'Could not extract bill details from the image. Please enter the amount manually.',
        };
    }
};
