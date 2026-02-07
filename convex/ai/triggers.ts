// AI Triggers - Hook AI processing into message flow

import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { internal, api } from "../_generated/api";

// This gets called after every new message (modify existing sendMessage)
export const triggerAIProcessing = internalMutation({
  args: {
    messageId: v.id("messages"),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // Schedule AI processing asynchronously (non-blocking)
    await ctx.scheduler.runAfter(0, api.ai.monitor.processMessage, {
      messageId: args.messageId,
      projectId: args.projectId,
    });
  },
});
