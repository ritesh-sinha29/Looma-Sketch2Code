import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// Helper to check if user is project owner
async function isProjectOwner(ctx: any, projectId: Id<"projects">, userId: Id<"users">) {
  const project = await ctx.db.get(projectId);
  return project && project.ownerId === userId;
}

// Create a new task (Owner only)
export const createTask = mutation({
  args: {
    projectId: v.id("projects"),
    taskName: v.string(),
    description: v.optional(v.string()),
    assigneeId: v.id("users"),
    priority: v.union(
      v.literal("critical"),
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    ),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done")
    ),
    deadline: v.number(),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error("User not found");

    const isOwner = await isProjectOwner(ctx, args.projectId, user._id);
    if (!isOwner) throw new Error("Only project owners can create tasks");

    // Create the task
    const taskId = await ctx.db.insert("tasks", {
      projectId: args.projectId,
      taskName: args.taskName,
      description: args.description,
      assigneeId: args.assigneeId,
      createdBy: user._id,
      priority: args.priority,
      status: args.status,
      deadline: args.deadline,
      tags: args.tags,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return taskId;
  },
});

// Update task details (Owner only)
export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    projectId: v.id("projects"),
    taskName: v.optional(v.string()),
    description: v.optional(v.string()),
    assigneeId: v.optional(v.id("users")),
    priority: v.optional(
      v.union(
        v.literal("critical"),
        v.literal("high"),
        v.literal("medium"),
        v.literal("low")
      )
    ),
    deadline: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error("User not found");

    const isOwner = await isProjectOwner(ctx, args.projectId, user._id);
    if (!isOwner) throw new Error("Only project owners can update tasks");

    const { taskId, projectId, ...updates } = args;

    await ctx.db.patch(taskId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Update task status (Assignee or Owner) -- simplified for now to allow dragging by team
export const updateTaskStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    // For now, we allow authenticated project members to move tasks
    
    await ctx.db.patch(args.taskId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});


// Delete task (Owner only)
export const deleteTask = mutation({
  args: {
    taskId: v.id("tasks"),
    projectId: v.id("projects"), // Pass projectId to verify ownership quickly
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error("User not found");

    const isOwner = await isProjectOwner(ctx, args.projectId, user._id);
    if (!isOwner) throw new Error("Only owners can delete tasks");

    await ctx.db.delete(args.taskId);
  },
});


// Get all tasks for a project with assignee details
export const getTasks = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Enrich tasks with assignee details
    const tasksWithAssignee = await Promise.all(
      tasks.map(async (task) => {
        const assignee = await ctx.db.get(task.assigneeId);
        return {
          ...task,
          assignee: assignee
            ? {
                name: assignee.name,
                email: assignee.email,
                imageUrl: assignee.imageUrl,
              }
            : null,
        };
      })
    );

    return tasksWithAssignee;
  },
});
