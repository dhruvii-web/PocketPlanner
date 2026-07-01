import { GoogleGenerativeAI } from "@google/generative-ai";

const getModel = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  return genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  });
};

export const generatePocketGuideReply = async ({ trip, messages = [], prompt }) => {
  const model = getModel();

  if (!model) {
    return "PocketGuide AI is not configured yet. Set GEMINI_API_KEY to enable trip assistance.";
  }

  const context = {
    trip,
    recentMessages: messages.slice(-12),
  };

  const instruction = `
You are PocketGuide, the AI trip assistant inside Pocket Planner.

Help with:
- trip planning
- family or group coordination
- budgets and packing
- local travel decisions
- itinerary suggestions
- chat-based help for the trip group

Keep responses concise, practical, and friendly.
When trip context is missing, ask one clarifying question.

Trip context:
${JSON.stringify(context, null, 2)}

User message:
${prompt}
`;

  const result = await model.generateContent(instruction);
  return result.response.text();
};