// AI Engine - Core AI logic and Gemini API integration
// Helper functions for AI processing

import { ActionCtx, MutationCtx } from "../_generated/server";
import { api, internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { AI_SYSTEM_PROMPT } from "./systemPrompt";

interface MessageContext {
  messageIds: Id<"messages">[];
  messages: Array<{
    author: string;
    text: string;
    timestamp: number;
    isAI: boolean;
  }>;
  currentMessage: {
    author: string;
    text: string;
  };
}

interface EngagementAnalysis {
  score: number; // 0.0 - 1.0
  reason: string; // "question" | "technical" | "discussion" | "none"
  shouldRespond: boolean;
}

interface AIConfig {
  enabled: boolean;
  lastResponseAt?: number;
  responsesToday: number;
  responseFrequency: "conservative" | "moderate" | "active";
  engagementThreshold: number;
}

// Build context from recent messages
export async function buildContext(
  ctx: ActionCtx,
  projectId: Id<"projects">,
  currentMessageId: Id<"messages">
): Promise<MessageContext> {
  // Fetch last 30 messages from project using internal query (no auth required)
  const messages = await ctx.runQuery(internal.messages.internalGetMessages, {
    projectId,
    limit: 30,
  });

  // Find current message
  const currentMessage = messages.find((m) => m._id === currentMessageId);

  if (!currentMessage) {
    throw new Error("Current message not found");
  }

  // Format for AI consumption
  return {
    messageIds: messages.map((m) => m._id),
    messages: messages.map((m) => ({
      author: m.user.name,
      text: m.text,
      timestamp: m.timestamp,
      isAI: m.isAI || false,
    })),
    currentMessage: {
      author: currentMessage.user.name,
      text: currentMessage.text,
    },
  };
}

// Analyze if AI should engage
export function analyzeEngagement(
  context: MessageContext
): EngagementAnalysis {
  let score = 0.0;
  let reason = "none";

  const msg = context.currentMessage.text.toLowerCase();

  // Check for direct questions
  if (msg.includes("?")) {
    score += 0.4;
    reason = "question";
  }

  // Check for technical keywords
  const technicalKeywords = [
    "error",
    "bug",
    "issue",
    "problem",
    "help",
    "how to",
    "deploy",
    "build",
    "code",
    "api",
    "database",
    "fix",
    "broken",
    "not working",
    "crash",
    "fail",
    // Collaboration & code review
    "implement",
    "refactor",
    "optimize",
    "review",
    "feedback",
    "design",
    "architecture",
    // Proactive assistance
    "wondering",
    "confused",
    "stuck",
    "anyone know",
    "does anyone",
    "best way to",
    "better way",
    // Decision making
    "which one",
    "option",
    "choice",
    "pros and cons",
    "trade-off",
    " vs ",
  ];

  if (technicalKeywords.some((kw) => msg.includes(kw))) {
    score += 0.3;
    if (reason === "none") reason = "technical";
  }

  // Check for discussion/brainstorming
  const discussionKeywords = [
    "what do you think",
    "ideas",
    "suggestions",
    "approach",
    "should we",
    "thoughts",
    "opinions",
    "recommend",
  ];

  if (discussionKeywords.some((kw) => msg.includes(kw))) {
    score += 0.3;
    if (reason === "none") reason = "discussion";
  }

  // Check for greetings (positive signal)
  const greetingKeywords = [
    "hello",
    "hi ",
    "hi!",
    "hey",
    "hii",
    "hiii",
    "hellooo",
    "hey there",
  ];

  if (greetingKeywords.some((kw) => msg.includes(kw))) {
    score += 0.6;
    if (reason === "none") reason = "greeting";
  }

  // Negative signals (reduce score) - social chatter
  const socialKeywords = [
    "lol",
    "haha",
    "birthday",
    "congrats",
    "thanks",
    "thank you",
    "good morning",
    "good night",
    "bye",
  ];

  if (socialKeywords.some((kw) => msg.includes(kw))) {
    score -= 0.5;
  }

  // Check conversation flow - detect active discussions
  const recentHumanMessages = context.messages
    .slice(-5)
    .filter((m) => !m.isAI).length;

  // If AI hasn't spoken and there are 3+ recent human messages, boost score
  const lastMessage = context.messages[context.messages.length - 1];
  if (recentHumanMessages >= 3 && !lastMessage?.isAI) {
    score += 0.2;
    if (reason === "none") reason = "active_discussion";
  }

  // Improved back-to-back logic
  // Allow AI to respond again if it's a direct follow-up question or multiple messages have passed
  if (lastMessage?.isAI) {
    // Find how many messages since AI last spoke
    const messagesSinceAI = context.messages
      .slice()
      .reverse()
      .findIndex((m) => m.isAI);

    if (msg.includes("?") && messagesSinceAI === 0) {
      // Direct follow-up question - don't penalize
      // Keep score as is
    } else if (messagesSinceAI >= 3) {
      // 3+ messages since AI spoke - reduce penalty
      score -= 0.1;
    } else {
      // Recent AI message - apply penalty
      score -= 0.3;
    }
  }

  return {
    score: Math.max(0, Math.min(1, score)), // Clamp between 0-1
    reason,
    shouldRespond: score >= 0.5, // Default threshold
  };
}

// Generate AI response via Gemini API
export async function generateAIResponse(
  context: MessageContext,
  analysis: EngagementAnalysis
): Promise<{
  content: string;
  usage: { promptTokens: number; completionTokens: number };
} | null> {
  const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error("Missing GOOGLE_GENERATIVE_AI_API_KEY");
    return null;
  }

  // Build conversation history for Gemini
  const conversationHistory = context.messages
    .slice(-10) // Last 10 messages for context
    .map((m) => `${m.author}: ${m.text}`)
    .join("\n\n");

  const prompt = `${AI_SYSTEM_PROMPT}

## Recent Conversation:

${conversationHistory}

## Your Response:

Respond naturally to the most recent message. Keep it concise and helpful.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      return null;
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      console.error("No candidates in Gemini response");
      return null;
    }

    const content = data.candidates[0].content.parts[0].text;

    // Estimate token usage (Gemini doesn't provide exact counts in response)
    const promptTokens = Math.ceil(prompt.length / 4);
    const completionTokens = Math.ceil(content.length / 4);

    return {
      content,
      usage: {
        promptTokens,
        completionTokens,
      },
    };
  } catch (error) {
    console.error("AI generation failed:", error);
    return null;
  }
}

// Rate limiting (DISABLED - unlimited responses)
export function checkRateLimit(config: AIConfig): boolean {
  // Rate limiting disabled - AI can always respond
  return true;
  
  /* Original rate limiting logic (commented out):
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;

  // Don't respond if AI responded in last 5 minutes
  if (config.lastResponseAt && config.lastResponseAt > fiveMinutesAgo) {
    return false;
  }

  // Daily limit based on frequency setting
  const dailyLimits = {
    conservative: 5,
    moderate: 15,
    active: 30,
  };

  const maxDaily = dailyLimits[config.responseFrequency];

  if (config.responsesToday >= maxDaily) {
    return false;
  }

  return true;
  */
}

// Get or create AI system user
export async function getOrCreateAIUser(ctx: MutationCtx) {
  // Check if AI user exists
  const existing = await ctx.db
    .query("users")
    .filter((q) => q.eq(q.field("email"), "ai@looma.system"))
    .first();

  if (existing) return existing;

  // Create AI user
  const now = Date.now();
  const aiUserId = await ctx.db.insert("users", {
    email: "ai@looma.system",
    name: "AI Assistant",
    tokenIdentifier: "ai-system-user",
    imageUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=ai-assistant",
    hasCompletedOnboarding: true,
    type: "free",
    limit: 3,
    usersType: "user",
    createdAt: now,
    updatedAt: now,
  });

  return await ctx.db.get(aiUserId);
}
