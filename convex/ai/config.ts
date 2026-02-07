
// Handles AI settings per project

import { v } from "convex/values";
import { mutation, query, internalQuery, internalMutation } from "../_generated/server";

// Get AI configuration for a project
export const getConfig = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    // Get current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user is project member
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is owner or member
    const isMember =
      project.ownerId === user._id ||
      project.projectMembers?.some((m) => m.userId === user._id);

    if (!isMember) {
      throw new Error("Not a project member");
    }

    // Get AI config or return default
    const config = await ctx.db
      .query("ai_config")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();

    if (!config) {
      // Return default config
      return {
        projectId: args.projectId,
        enabled: false,
        responsesToday: 0,
        responseFrequency: "moderate" as const,
        engagementThreshold: 0.5,
      };
    }

    return config;
  },
});

// Internal version of getConfig (for AI processing without auth)
export const internalGetConfig = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    // Get AI config or return default (no auth check needed for internal use)
    const config = await ctx.db
      .query("ai_config")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();

    if (!config) {
      // Return default config
      return {
        projectId: args.projectId,
        enabled: false,
        responsesToday: 0,
        responseFrequency: "moderate" as const,
        engagementThreshold: 0.5,
      };
    }

    return config;
  },
});

// Toggle AI on/off
export const toggleAI = mutation({
  args: {
    projectId: v.id("projects"),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Get current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user is project owner
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    if (project.ownerId !== user._id) {
      throw new Error("Only project owner can toggle AI");
    }

    // Check if config exists
    const existing = await ctx.db
      .query("ai_config")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();

    const now = Date.now();

    if (existing) {
      // Update existing config
      await ctx.db.patch(existing._id, {
        enabled: args.enabled,
        updatedAt: now,
      });
      return { ...existing, enabled: args.enabled, updatedAt: now };
    } else {
      // Create new config
      const configId = await ctx.db.insert("ai_config", {
        projectId: args.projectId,
        enabled: args.enabled,
        responsesToday: 0,
        responseFrequency: "moderate",
        engagementThreshold: 0.5,
        createdAt: now,
        updatedAt: now,
      });

      return await ctx.db.get(configId);
    }
  },
});

// Update AI settings (frequency, threshold)
export const updateSettings = mutation({
  args: {
    projectId: v.id("projects"),
    responseFrequency: v.optional(
      v.union(
        v.literal("conservative"),
        v.literal("moderate"),
        v.literal("active")
      )
    ),
    engagementThreshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user is project owner
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    if (project.ownerId !== user._id) {
      throw new Error("Only project owner can update AI settings");
    }

    // Validate threshold
    if (
      args.engagementThreshold !== undefined &&
      (args.engagementThreshold < 0 || args.engagementThreshold > 1)
    ) {
      throw new Error("Engagement threshold must be between 0 and 1");
    }

    // Get existing config
    const config = await ctx.db
      .query("ai_config")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();

    if (!config) {
      throw new Error("AI config not found. Please enable AI first.");
    }

    // Update config
    const updates: any = { updatedAt: Date.now() };
    if (args.responseFrequency !== undefined) {
      updates.responseFrequency = args.responseFrequency;
    }
    if (args.engagementThreshold !== undefined) {
      updates.engagementThreshold = args.engagementThreshold;
    }

    await ctx.db.patch(config._id, updates);
    return await ctx.db.get(config._id);
  },
});

// Internal mutation to update rate limits
export const updateRateLimits = internalMutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query("ai_config")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();

    if (!config) return;

    await ctx.db.patch(config._id, {
      lastResponseAt: Date.now(),
      responsesToday: config.responsesToday + 1,
      updatedAt: Date.now(),
    });
  },
});

