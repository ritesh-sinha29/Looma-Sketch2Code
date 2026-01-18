import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ==============================
// CREATE STYLE GUIDE
// ==============================
export const createStyleGuide = mutation({
  args: {
    name: v.string(),
    colors: v.any(),
    fonts: v.any(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthenticated");
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

    const styleGuideId = await ctx.db.insert("styleGuides", {
      name: args.name,
      userId: user._id,
      colors: args.colors,
      fonts: args.fonts,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return styleGuideId;
  },
});

// ==============================
// GET USER STYLE GUIDES
// ==============================
export const getUserStyleGuides = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      return [];
    }

    const styleGuides = await ctx.db
      .query("styleGuides")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc") // Most recent first (if there was an index order, usually created time is implicit or we can sort in memory. Default order is creation time usually)
      .collect();

    return styleGuides;
  },
});
