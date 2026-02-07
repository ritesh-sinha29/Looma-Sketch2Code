import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

// SERVER-SIDE QUERY: Get messages for a project with user data enrichment
export const getMessages = query({
  args: {
    projectId: v.id("projects"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Get current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify user is a project member
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const isOwner = project.ownerId === user._id;
    const isMember = project.projectMembers?.some(
      (member) => member.userId === user._id
    );

    if (!isOwner && !isMember) {
      throw new Error("Not authorized to view this project's messages");
    }

    // Fetch messages with pagination (server-side)
    const limit = args.limit ?? 50;
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_project_timestamp", (q) =>
        q.eq("projectId", args.projectId)
      )
      .order("desc")
      .take(limit);

    // SERVER-SIDE DATA ENRICHMENT: Join user data for each message
    const enrichedMessages = await Promise.all(
      messages.map(async (message) => {
        const messageUser = await ctx.db.get(message.userId);
        
        // Get reaction counts for this message (server-side aggregation)
        const reactions = await ctx.db
          .query("reactions")
          .withIndex("by_message", (q) => q.eq("messageId", message._id))
          .collect();

        // Aggregate reactions by emoji
        const reactionCounts = reactions.reduce((acc, reaction) => {
          acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return {
          ...message,
          user: {
            _id: messageUser?._id,
            name: messageUser?.name || "Unknown User",
            imageUrl: messageUser?.imageUrl,
          },
          reactionCounts,
        };
      })
    );

    // Return in chronological order (oldest first)
    return enrichedMessages.reverse();
  },
});

// INTERNAL QUERY: Get messages for AI processing (no auth required)
export const internalGetMessages = internalQuery({
  args: {
    projectId: v.id("projects"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // No authentication check - this is for internal AI use only
    const limit = args.limit ?? 50;
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_project_timestamp", (q) =>
        q.eq("projectId", args.projectId)
      )
      .order("desc")
      .take(limit);

    // Enrich with user data
    const enrichedMessages = await Promise.all(
      messages.map(async (message) => {
        const messageUser = await ctx.db.get(message.userId);
        
        const reactions = await ctx.db
          .query("reactions")
          .withIndex("by_message", (q) => q.eq("messageId", message._id))
          .collect();

        const reactionCounts = reactions.reduce((acc, reaction) => {
          acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return {
          ...message,
          user: {
            _id: messageUser?._id,
            name: messageUser?.name || "Unknown User",
            imageUrl: messageUser?.imageUrl,
          },
          reactionCounts,
        };
      })
    );

    return enrichedMessages.reverse();
  },
});

// SERVER-SIDE MUTATION: Send a message with full validation
export const sendMessage = mutation({
  args: {
    projectId: v.id("projects"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Get current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // SERVER-SIDE VALIDATION: Check project membership
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const isOwner = project.ownerId === user._id;
    const isMember = project.projectMembers?.some(
      (member) => member.userId === user._id
    );

    if (!isOwner && !isMember) {
      throw new Error("Not authorized to send messages in this project");
    }

    // SERVER-SIDE VALIDATION: Sanitize and validate text
    const sanitizedText = args.text.trim();
    if (sanitizedText.length === 0) {
      throw new Error("Message cannot be empty");
    }
    if (sanitizedText.length > 5000) {
      throw new Error("Message too long (max 5000 characters)");
    }

    // SERVER-SIDE RATE LIMITING: Check recent messages
    const oneMinuteAgo = Date.now() - 60 * 1000;
    const recentMessages = await ctx.db
      .query("messages")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.gte(q.field("timestamp"), oneMinuteAgo))
      .collect();

    if (recentMessages.length >= 10) {
      throw new Error("Rate limit exceeded. Please slow down.");
    }

    // SERVER-SIDE: Generate timestamp
    const timestamp = Date.now();

    // Insert message
    const messageId = await ctx.db.insert("messages", {
      projectId: args.projectId,
      userId: user._id,
      text: sanitizedText,
      timestamp,
    });

    // Trigger AI processing asynchronously (non-blocking)
    await ctx.scheduler.runAfter(0, internal.ai.triggers.triggerAIProcessing, {
      messageId: messageId,
      projectId: args.projectId,
    });

    // Return enriched message
    return {
      _id: messageId,
      projectId: args.projectId,
      userId: user._id,
      text: sanitizedText,
      timestamp,
      user: {
        _id: user._id,
        name: user.name,
        imageUrl: user.imageUrl,
      },
    };
  },
});

// SERVER-SIDE MUTATION: Edit a message with authorization
export const editMessage = mutation({
  args: {
    messageId: v.id("messages"),
    text: v.string(),
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

    // Get the message
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // SERVER-SIDE AUTHORIZATION: Verify user is the author
    if (message.userId !== user._id) {
      throw new Error("Not authorized to edit this message");
    }

    // SERVER-SIDE VALIDATION: Validate new text
    const sanitizedText = args.text.trim();
    if (sanitizedText.length === 0) {
      throw new Error("Message cannot be empty");
    }
    if (sanitizedText.length > 5000) {
      throw new Error("Message too long (max 5000 characters)");
    }

    // Update message with server-side timestamp
    await ctx.db.patch(args.messageId, {
      text: sanitizedText,
      isEdited: true,
      editedAt: Date.now(),
    });

    return { success: true };
  },
});

// SERVER-SIDE MUTATION: Delete a message with permission check
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
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

    // Get the message
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Get the project to check if user is owner
    const project = await ctx.db.get(message.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // SERVER-SIDE AUTHORIZATION: User must be author OR project owner
    const isAuthor = message.userId === user._id;
    const isProjectOwner = project.ownerId === user._id;

    if (!isAuthor && !isProjectOwner) {
      throw new Error("Not authorized to delete this message");
    }

    // SERVER-SIDE CASCADE: Delete all reactions for this message
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .collect();

    for (const reaction of reactions) {
      await ctx.db.delete(reaction._id);
    }

    // Delete the message
    await ctx.db.delete(args.messageId);

    return { success: true };
  },
});
