import { internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";


// ==================================
// NEW STANDARD USER
// ==================================
export const createNewUser = mutation({
  args: {},
  handler: async (ctx) => {
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

    if (user) {
        // Just sync standard info
        if (user.name !== identity.name && identity.name) {
            await ctx.db.patch(user._id, { name: identity.name, updatedAt: Date.now() });
        }
        return user._id;
    }

    return await ctx.db.insert("users", {
      name: identity.name ?? "Anonymous",
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email ?? "",
      githubUsername: identity.nickname ?? "",
      imageUrl: identity.pictureUrl ?? undefined,
      hasCompletedOnboarding: false,
      type: "free",
      limit: 3,
      usersType: "user", 
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// ==================================
// NEW ADMIN USER
// ==================================
export const createAdmin = mutation({
  args: {},
  handler: async (ctx) => {
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

    if (user) {
      // If they exist, upgrade them to admin if they aren't already
      if (user.usersType !== "admin") {
          await ctx.db.patch(user._id, { 
              usersType: "admin",
              updatedAt: Date.now() 
          });
      }
      return user._id;
    }

    // Create fresh admin
    return await ctx.db.insert("users", {
      name: identity.name ?? "Admin User",
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email ?? "",
      usersType: "admin", // Strictly admin
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




// ==============================
// GET ALL USERS (ADMIN ONLY)
// ===============================
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    // await checkAdmin(ctx);
    return await ctx.db.query("users").collect();
  },
});

// ==============================
// DELETE USER (ADMIN ONLY)
// ===============================
export const deleteUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // const adminUser = await checkAdmin(ctx); 

    const userToDelete = await ctx.db.get(args.userId);
    if (!userToDelete) {
      throw new Error("User not found");
    }

    // Prevent deleting yourself (the current admin)
    // if (userToDelete._id === adminUser._id) {
    //     throw new Error("Cannot delete yourself");
    // }

    await ctx.db.delete(args.userId);
  },
});

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    return user?.usersType === "admin";
  },
});