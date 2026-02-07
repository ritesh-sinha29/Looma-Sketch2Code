import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// =======================
// Create Project
// =======================
export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()), // Added description to match schema more closely if needed, though mostly optional
    tags: v.array(v.string()),
    isPublic: v.boolean(),
    ownerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const user = await ctx.db.get(args.ownerId);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.tokenIdentifier !== identity.tokenIdentifier) {
      throw new Error("Unauthorized");
    }

    const inviteCode = Math.random().toString(36).substring(2, 10);
    const inviteLink = `http://localhost:3000/invite/${inviteCode}`;

    const projectId = await ctx.db.insert("projects", {
      projectName: args.name,
      projectDescription: args.description,
      projectTags: args.tags,
      ownerId: args.ownerId,
      ownerEmail: user.email,
      inviteCode: inviteCode,
      inviteLink: inviteLink,
      isPublic: args.isPublic,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { projectId, inviteLink };
  },
});

// =====================
// GET ALL PROJECTS FOR LOGGED IN USER
// =====================
export const getProjects = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    return ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();
  },
});

// ============================
// GET PROJECT BY ID
// ============================
export const getProjectById = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthenticated");
    }
    return ctx.db.get(args.projectId);
  },
});

// ============================
// GET PROJECT BY INVITE CODE
// ============================
export const getProjectByInviteCode = query({
  args: {
    inviteCode: v.string(),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db
      .query("projects")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode))
      .unique();

    return project;
  },
});

// ============================
// JOIN PROJECT
// ============================
export const joinProject = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    console.log("Trying to get identity to join project!");

    if (!identity) {
      throw new Error("Unauthenticated");
    }

    console.log("Identity checked , now checking for user...");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const project = await ctx.db.get(args.projectId);

    if (!project) {
      throw new Error("Project not found");
    }

    // Check if already a member
    if (project.projectMembers?.some((m) => m.userId === user._id)) {
      return { success: false, message: "Already a member" };
    }

    const newMembers = project.projectMembers
      ? [
          ...project.projectMembers,
          { userId: user._id, avatar: user.imageUrl || "" },
        ]
      : [{ userId: user._id, avatar: user.imageUrl || "" }];

    await ctx.db.patch(args.projectId, {
      projectMembers: newMembers,
    });

    return { success: true, message: "Joined successfully" };
  },
});

// ===============================
// GET OWNER + PROJECT MEMBERS
// ===============================

export const getOwnerAndProjectMembers = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    const owner = await ctx.db.get(project.ownerId);
    if (!owner) {
      throw new Error("Owner not found");
    }

    const members = await Promise.all(
      (project.projectMembers || []).map((member) => ctx.db.get(member.userId)),
    );

    return {
      owner,
      members: members.filter((m) => m !== null),
    };
  },
});

// ===============================
// REMOVE PROJECT MEMBER
// ===============================

export const removeMember = mutation({
  args: {
    projectId: v.id("projects"),
    memberId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (project.ownerId !== user._id) {
      throw new Error("Unauthorized");
    }

    const newMembers = (project.projectMembers || []).filter(
      (member) => member.userId !== args.memberId,
    );

    await ctx.db.patch(args.projectId, {
      projectMembers: newMembers,
    });
  },
});

// ===============================
// GET PROJECTS WHERE USER IS MEMBER
// ===============================
export const getMemberProjects = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Since we can't easily index arrays in Convex for 'contains',
    // we fetch and filter. For scale, we'd use a separate joining table.
    const allProjects = await ctx.db.query("projects").collect();

    return allProjects.filter(
      (project) =>
        project.ownerId !== user._id &&
        project.projectMembers?.some((m) => m.userId === user._id),
    );
  },
});

// ============================
// GET ALL CODESPACE BY PROJECT ID
// ============================
export const getCodespaces = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const codespaces = await ctx.db
      .query("codespaces")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    return codespaces;
  },
});
// ============================
// SAVE CODESPACE (Use 'any' for code to be safe, or string)
// ============================
export const saveCodespace = mutation({
  args: {
    projectId: v.id("projects"),
    code: v.string(),
    description: v.optional(v.string()), // Added description
    name: v.optional(v.string()), // Added name
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Check if user is a member of the project
    const isMember =
      project.ownerId === user._id ||
      project.projectMembers?.some((m) => m.userId === user._id);

    if (!isMember) {
      throw new Error("Unauthorized");
    }

    // Validate code is not empty
    if (!args.code?.trim()) {
      throw new Error("Code cannot be empty");
    }

    // Check for existing codespace with the same name (optimized query)
    const existingCodespace = args.name
      ? await ctx.db
          .query("codespaces")
          .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
          .filter((q) => q.eq(q.field("codespaceName"), args.name))
          .first()
      : null;

    if (existingCodespace) {
      // Update existing
      await ctx.db.patch(existingCodespace._id, {
        code: args.code,
        codespaceDescription: args.description,
        updatedBy: user._id, 
        updatedAt: Date.now(),
      });
      return existingCodespace._id;
    } else {
      // Insert new
      const codespaceId = await ctx.db.insert("codespaces", {
        projectId: args.projectId,
        code: args.code,
        createdBy: user._id,
        updatedBy: user._id,
        codespaceDescription: args.description,
        codespaceName: args.name,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return codespaceId;
    }
  },
});
