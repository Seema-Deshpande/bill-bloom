import { GoogleGenAI } from "@google/genai";

export const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined in the environment variables");
    }
    return new GoogleGenAI({ apiKey });
}

export const generateAIContent = async (prompt) => {
    const client = getGeminiClient();
    const response = await client.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
        contents: prompt,
    });
    return response.text;
}

export const generateAIContentWithImage = async (prompt, image, mimeType) => {
    const client = getGeminiClient();
    const response = await client.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
        contents: [
            {
                parts: [
                    { inlineData: {mimeType, data: image} },
                    { text: prompt}
                ]
            }
        ]
    });
    return response.text;
}

const CATEGORY_KEYWORDS = {
    Food: ["restaurant", "cafe", "pizza", "burger", "lunch", "dinner", "breakfast", "food", "groceries", "supermarket", "market", "meat", "dairy", "bakery"],
    Travel: ["uber", "lyft", "taxi", "flight", "hotel", "airline", "train", "bus", "parking", "gas", "fuel", "travel", "hostel"],
    Grocery: ["grocery", "whole foods", "costco", "trader joe's", "walmart", "target", "shopping", "produce", "vegetables"],
    Rent: ["rent", "landlord", "lease", "apartment", "housing", "mortgage", "property", "tenant"],
    Entertainment: ["movie", "cinema", "netflix", "spotify", "concert", "ticket", "game", "subscription", "streaming"],
    Utilities: ["electricity", "water", "internet", "wifi", "phone", "bill", "utility", "broadband"],
    Healthcare: ["doctor", "hospital", "pharmacy", "medicine", "clinic", "dental", "health", "medical"],
    Misc: ["misc", "miscellaneous", "random"],
};

export const VALID_CATEGORIES = Object.keys(CATEGORY_KEYWORDS);

export const suggestCategoryByKeyword = (text) => {
    const lowerText = text.toLowerCase();
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const keyword of keywords) {
            if (lowerText.includes(keyword)) {
                return category;
            }
        }
    }
    return "Misc";
};

export const extractJSONFromAIResponse = (rawText) => {
    const cleaned = rawText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
};
