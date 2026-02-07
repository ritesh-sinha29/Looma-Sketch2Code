// AI Monitor - Main AI processing pipeline
// Triggered after each new message

import { v } from "convex/values";
import { action, internalMutation } from "../_generated/server";
import { internal, api } from "../_generated/api";
import {
  buildContext,
  analyzeEngagement,
  generateAIResponse,
  checkRateLimit,
  getOrCreateAIUser,
} from "./engine";
import { Id } from "../_generated/dataModel";

// Main AI processing function (called after each new message)
export const processMessage = action({
  args: {
    messageId: v.id("messages"),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    try {
      // 1. Check if AI is enabled for this project
      const config = await ctx.runQuery(internal.ai.config.internalGetConfig, {
        projectId: args.projectId,
      });

      if (!config?.enabled) {
        console.log("AI not enabled for project");
        return;
      }

      // 2. Check rate limits
      const canRespond = checkRateLimit(config);
      if (!canRespond) {
        console.log("Rate limit exceeded");
        return;
      }

      // 3. Build message context (last 30 messages)
      const context = await buildContext(ctx, args.projectId, args.messageId);

      // 4. Analyze engagement (should AI respond?)
      const analysis = analyzeEngagement(context);

      console.log("Engagement analysis:", {
        score: analysis.score,
        reason: analysis.reason,
        threshold: config.engagementThreshold,
      });

      if (analysis.score < config.engagementThreshold) {
        console.log("Engagement score too low:", analysis.score);
        return;
      }

      // 5. Generate AI response via Gemini API
      const response = await generateAIResponse(context, analysis);

      if (!response) {
        console.log("Failed to generate AI response");
        return;
      }

      // 6. Send AI message to chat
      await ctx.runMutation(internal.ai.monitor.sendAIMessage, {
        projectId: args.projectId,
        text: response.content,
        metadata: {
          confidenceScore: analysis.score,
          engagementReason: analysis.reason,
          contextMessageIds: context.messageIds.slice(-10), // Last 10 messages
          promptTokens: response.usage.promptTokens,
          completionTokens: response.usage.completionTokens,
        },
      });

      // 7. Update rate limit counters
      await ctx.runMutation(internal.ai.config.updateRateLimits, {
        projectId: args.projectId,
      });

      console.log("AI response sent successfully");
    } catch (error) {
      console.error("Error in AI processing:", error);
    }
  },
});

// Internal mutation to send AI message
export const sendAIMessage = internalMutation({
  args: {
    projectId: v.id("projects"),
    text: v.string(),
    metadata: v.object({
      confidenceScore: v.number(),
      engagementReason: v.string(),
      contextMessageIds: v.array(v.id("messages")),
      promptTokens: v.number(),
      completionTokens: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    // Get or create AI user account (special system user)
    const aiUser = await getOrCreateAIUser(ctx);

    if (!aiUser) {
      console.error("Failed to get or create AI user");
      return;
    }

    // Insert AI message into messages table
    await ctx.db.insert("messages", {
      projectId: args.projectId,
      userId: aiUser._id,
      text: args.text,
      timestamp: Date.now(),
      isAI: true,
      aiMetadata: args.metadata,
    });

    // AI message appears in real-time via existing Convex subscriptions
  },
});
