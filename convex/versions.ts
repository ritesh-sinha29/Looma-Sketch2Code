// convex/versions.ts
// Add this file to your convex/ directory

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============================================================================
// QUERIES
// ============================================================================

// Get all versions for a component (or all for project if no name provided)
export const getComponentVersions = query({
  args: {
    projectId: v.id("projects"),
    componentName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let versions;
    
    if (args.componentName) {
      versions = await ctx.db
        .query("componentVersions")
        .withIndex("by_component", (q) =>
          q.eq("projectId", args.projectId).eq("componentName", args.componentName!)
        )
        .filter((q) => q.eq(q.field("isApproved"), true))
        .order("desc")
        .collect();
    } else {
      versions = await ctx.db
        .query("componentVersions")
        .withIndex("by_component", (q) => q.eq("projectId", args.projectId))
        .filter((q) => q.eq(q.field("isApproved"), true))
        .order("desc")
        .collect();
    }

    const versionsWithUsers = await Promise.all(
      versions.map(async (version) => {
        const creator = await ctx.db.get(version.createdBy);
        const approver = version.approvedBy ? await ctx.db.get(version.approvedBy) : null;
        return {
          ...version,
          creator: { name: creator?.name, email: creator?.email },
          approver: approver ? { name: approver.name, email: approver.email } : null,
        };
      })
    );

    return versionsWithUsers;
  },
});

// Get approved version
export const getApprovedVersion = query({
  args: {
    projectId: v.id("projects"),
    componentName: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("componentVersions")
      .withIndex("by_component", (q) =>
        q.eq("projectId", args.projectId).eq("componentName", args.componentName)
      )
      .filter((q) => q.eq(q.field("isApproved"), true))
      .order("desc")
      .first();
  },
});

// Get pending change requests
export const getPendingChangeRequests = query({
  args: { 
    projectId: v.id("projects"),
    componentName: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let requests = await ctx.db
      .query("changeRequests")
      .withIndex("by_status", (q) =>
        q.eq("projectId", args.projectId).eq("status", "pending")
      )
      .order("desc")
      .collect();

    if (args.componentName) {
      requests = requests.filter((r) => r.componentName === args.componentName);
    }

    return await Promise.all(
      requests.map(async (cr) => {
        const requester = await ctx.db.get(cr.requestedBy);
        const proposedVersion = await ctx.db.get(cr.proposedVersionId);
        const currentVersion = cr.currentVersionId ? await ctx.db.get(cr.currentVersionId) : null;
        return {
          ...cr,
          requester: { name: requester?.name, email: requester?.email },
          proposedVersion,
          currentVersion,
        };
      })
    );
  },
});

// Get change request details
export const getChangeRequestDetails = query({
  args: { changeRequestId: v.id("changeRequests") },
  handler: async (ctx, args) => {
    const cr = await ctx.db.get(args.changeRequestId);
    if (!cr) return null;

    const requester = await ctx.db.get(cr.requestedBy);
    const proposedVersion = await ctx.db.get(cr.proposedVersionId);
    const currentVersion = cr.currentVersionId ? await ctx.db.get(cr.currentVersionId) : null;

    return {
      ...cr,
      requester: { name: requester?.name, email: requester?.email },
      proposedVersion,
      currentVersion,
    };
  },
});

// Get rejected change requests for history
export const getRejectedChangeRequests = query({
  args: {
    projectId: v.id("projects"),
    componentName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let requests = await ctx.db
      .query("changeRequests")
      .withIndex("by_status", (q) =>
        q.eq("projectId", args.projectId).eq("status", "rejected")
      )
      .order("desc")
      .collect();

    if (args.componentName) {
      requests = requests.filter((r) => r.componentName === args.componentName);
    }

    return await Promise.all(
      requests.map(async (cr) => {
        const requester = await ctx.db.get(cr.requestedBy);
        const reviewer = cr.reviewedBy ? await ctx.db.get(cr.reviewedBy) : null;
        const proposedVersion = await ctx.db.get(cr.proposedVersionId);
        
        return {
          ...cr,
          requester: { name: requester?.name, email: requester?.email },
          reviewer: reviewer ? { name: reviewer.name, email: reviewer.email } : null,
          proposedVersion,
        };
      })
    );
  },
});

// Get all unique components for a project
export const getAllComponents = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const versions = await ctx.db
      .query("componentVersions")
      .withIndex("by_component", (q) => q.eq("projectId", args.projectId))
      .collect();

    // extract unique names
    const names = new Set(versions.map((v) => v.componentName));
    return Array.from(names).sort();
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

// Create new version
export const createVersion = mutation({
  args: {
    projectId: v.id("projects"),
    componentName: v.string(),
    componentCode: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    const isMember = project.ownerId === user._id || project.projectMembers?.some((m) => m.userId === user._id);
    if (!isMember) throw new Error("Not a project member");

    // Get latest version number
    const latestVersion = await ctx.db
      .query("componentVersions")
      .withIndex("by_component", (q) =>
        q.eq("projectId", args.projectId).eq("componentName", args.componentName)
      )
      .order("desc")
      .first();

    const newVersionNumber = latestVersion ? latestVersion.version + 1 : 1;
    const isOwner = project.ownerId === user._id;

    // Create version
    const versionId = await ctx.db.insert("componentVersions", {
      projectId: args.projectId,
      componentName: args.componentName,
      componentCode: args.componentCode,
      createdBy: user._id,
      createdAt: Date.now(),
      version: newVersionNumber,
      isApproved: isOwner, // Auto-approve if owner
      approvedBy: isOwner ? user._id : undefined,
      approvedAt: isOwner ? Date.now() : undefined,
      description: args.description,
    });

    return versionId;
  },
});

// Create change request
export const createChangeRequest = mutation({
  args: {
    projectId: v.id("projects"),
    componentName: v.string(),
    currentVersionId: v.optional(v.id("componentVersions")),
    proposedVersionId: v.id("componentVersions"),
    linesAdded: v.number(),
    linesRemoved: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");

    return await ctx.db.insert("changeRequests", {
      projectId: args.projectId,
      componentName: args.componentName,
      currentVersionId: args.currentVersionId,
      proposedVersionId: args.proposedVersionId,
      requestedBy: user._id,
      requestedAt: Date.now(),
      status: "pending",
      linesAdded: args.linesAdded,
      linesRemoved: args.linesRemoved,
    });
  },
});

// Approve change request
export const approveChangeRequest = mutation({
  args: {
    changeRequestId: v.id("changeRequests"),
    comments: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");

    const cr = await ctx.db.get(args.changeRequestId);
    if (!cr) throw new Error("Change request not found");

    const project = await ctx.db.get(cr.projectId);
    if (!project || project.ownerId !== user._id) {
      throw new Error("Only owner can approve");
    }

    // Update change request
    await ctx.db.patch(args.changeRequestId, {
      status: "approved",
      reviewedBy: user._id,
      reviewedAt: Date.now(),
      reviewComments: args.comments,
    });

    // Approve version
    await ctx.db.patch(cr.proposedVersionId, {
      isApproved: true,
      approvedBy: user._id,
      approvedAt: Date.now(),
    });

    return { success: true };
  },
});

// Reject change request
export const rejectChangeRequest = mutation({
  args: {
    changeRequestId: v.id("changeRequests"),
    comments: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");

    const cr = await ctx.db.get(args.changeRequestId);
    if (!cr) throw new Error("Change request not found");

    const project = await ctx.db.get(cr.projectId);
    if (!project || project.ownerId !== user._id) {
      throw new Error("Only owner can reject");
    }

    await ctx.db.patch(args.changeRequestId, {
      status: "rejected",
      reviewedBy: user._id,
      reviewedAt: Date.now(),
      reviewComments: args.comments,
    });

    return { success: true };
  },
});