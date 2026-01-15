import { internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";


// ==================================
// NEW USER
// ==================================
export const createNewUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    // console.log("identity from clerk ", identity);
    // Find user by tokenIdentifier
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    // If user already exists
    if (user) {
      const updates: Partial<typeof user> = {};

      if (user.name !== identity.name && identity.name) {
        updates.name = identity.name;
      }

      if (Object.keys(updates).length > 0) {
        updates.updatedAt = Date.now();
        await ctx.db.patch(user._id, updates);
      }

      return user._id;
    }

    // Create new user
    return await ctx.db.insert("users", {
      name: identity.name ?? "Anonymous",
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email ?? "",
      imageUrl: identity.pictureUrl ?? undefined,

      hasCompletedOnboarding: false,

      githubUsername: identity.nickname ?? undefined,
      type: "free",
      limit: 2,

      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// ==============================
// GET CURRENT USER
// ===============================
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    return user ?? null;
  },
});

// ==============================
// UPDATE USER THEME
// ===============================
export const updateUserTheme = mutation({
  args: {
    theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if the user exists
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    // Verify authentication matches or just allow if we trust the client to pass the right ID (usually better to check identity)
     const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // In a real app we should check if identity.tokenIdentifier matches user.tokenIdentifier
    if(user.tokenIdentifier !== identity.tokenIdentifier) {
        throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.userId, {
      preferedTheme: args.theme,
      updatedAt: Date.now(),
    });
  },
});

// ==============================
// COMPLETE ONBOARDING
// ===============================
export const completeOnboarding = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }
    
    if(user.tokenIdentifier !== identity.tokenIdentifier) {
        throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.userId, {
      hasCompletedOnboarding: true,
      updatedAt: Date.now(),
    });
  },
});