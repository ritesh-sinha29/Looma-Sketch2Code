import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internalMutation } from "./_generated/server";

// SERVER-SIDE QUERY: Get online users with presence calculation
export const getOnlineUsers = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // SERVER-SIDE PRESENCE CALCULATION: Users are online if lastActive within 60 seconds
    const sixtySecondsAgo = Date.now() - 60 * 1000;

    const presenceRecords = await ctx.db
      .query("presence")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // SERVER-SIDE ENRICHMENT: Add user data and calculate online status
    const enrichedPresence = await Promise.all(
      presenceRecords.map(async (presence) => {
        const user = await ctx.db.get(presence.userId);
        const isOnline = presence.lastActive >= sixtySecondsAgo;

        return {
          userId: presence.userId,
          isOnline,
          isTyping: presence.isTyping && isOnline, // Only show typing if online
          lastActive: presence.lastActive,
          user: user
            ? {
                _id: user._id,
                name: user.name,
                imageUrl: user.imageUrl,
              }
            : null,
        };
      })
    );

    // Filter out records without valid users and sort (online first)
    return enrichedPresence
      .filter((p) => p.user !== null)
      .sort((a, b) => {
        if (a.isOnline && !b.isOnline) return -1;
        if (!a.isOnline && b.isOnline) return 1;
        return b.lastActive - a.lastActive;
      });
  },
});

// SERVER-SIDE QUERY: Get users currently typing
export const getTypingUsers = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // SERVER-SIDE: Auto-expire typing indicators after 3 seconds
    const threeSecondsAgo = Date.now() - 3 * 1000;

    const presenceRecords = await ctx.db
      .query("presence")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) =>
        q.and(
          q.eq(q.field("isTyping"), true),
          q.gte(q.field("lastActive"), threeSecondsAgo)
        )
      )
      .collect();

    // Enrich with user data
    const typingUsers = await Promise.all(
      presenceRecords.map(async (presence) => {
        const user = await ctx.db.get(presence.userId);
        return user
          ? {
              _id: user._id,
              name: user.name,
              imageUrl: user.imageUrl,
            }
          : null;
      })
    );

    return typingUsers.filter((u) => u !== null);
  },
});

// SERVER-SIDE MUTATION: Update presence (heartbeat)
export const updatePresence = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
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

    // SERVER-SIDE: Upsert presence record with current timestamp
    const existingPresence = await ctx.db
      .query("presence")
      .withIndex("by_user_and_project", (q) =>
        q.eq("userId", user._id).eq("projectId", args.projectId)
      )
      .unique();

    const now = Date.now();

    if (existingPresence) {
      await ctx.db.patch(existingPresence._id, {
        isOnline: true,
        lastActive: now,
      });
    } else {
      await ctx.db.insert("presence", {
        userId: user._id,
        projectId: args.projectId,
        isOnline: true,
        isTyping: false,
        lastActive: now,
      });
    }

    return { success: true };
  },
});

// SERVER-SIDE MUTATION: Set typing status
export const setTyping = mutation({
  args: {
    projectId: v.id("projects"),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
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

    // SERVER-SIDE: Update typing status with server timestamp
    const existingPresence = await ctx.db
      .query("presence")
      .withIndex("by_user_and_project", (q) =>
        q.eq("userId", user._id).eq("projectId", args.projectId)
      )
      .unique();

    const now = Date.now();

    if (existingPresence) {
      await ctx.db.patch(existingPresence._id, {
        isTyping: args.isTyping,
        lastActive: now,
      });
    } else {
      // Create presence record if it doesn't exist
      await ctx.db.insert("presence", {
        userId: user._id,
        projectId: args.projectId,
        isOnline: true,
        isTyping: args.isTyping,
        lastActive: now,
      });
    }

    return { success: true };
  },
});

// SERVER-SIDE SCHEDULED FUNCTION: Clean up stale presence records
export const cleanupStalePresence = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Remove presence records older than 10 minutes
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;

    const staleRecords = await ctx.db
      .query("presence")
      .withIndex("by_last_active", (q) => q.lt("lastActive", tenMinutesAgo))
      .collect();

    for (const record of staleRecords) {
      await ctx.db.delete(record._id);
    }

    return { deleted: staleRecords.length };
  },
});
