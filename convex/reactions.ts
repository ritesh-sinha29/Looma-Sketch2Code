import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { isValidEmojiId } from "./emojiConstants";

// SERVER-SIDE QUERY: Get reactions for a message with aggregation
export const getReactionsByMessage = query({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    // Fetch all reactions for this message
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .collect();

    // SERVER-SIDE AGGREGATION: Group by emoji and include user details
    const reactionsByEmoji: Record<
      string,
      { count: number; users: Array<{ _id: string; name: string; imageUrl?: string }> }
    > = {};

    for (const reaction of reactions) {
      if (!reactionsByEmoji[reaction.emoji]) {
        reactionsByEmoji[reaction.emoji] = { count: 0, users: [] };
      }

      const user = await ctx.db.get(reaction.userId);
      if (user) {
        reactionsByEmoji[reaction.emoji].count++;
        reactionsByEmoji[reaction.emoji].users.push({
          _id: user._id,
          name: user.name,
          imageUrl: user.imageUrl,
        });
      }
    }

    return reactionsByEmoji;
  },
});

// SERVER-SIDE MUTATION: Toggle reaction (smart add/remove)
export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
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

    // SERVER-SIDE VALIDATION: Verify emoji is from approved list
    if (!isValidEmojiId(args.emoji)) {
      throw new Error("Invalid emoji");
    }

    // Verify message exists
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // SERVER-SIDE VALIDATION: Verify user has access to the project
    const project = await ctx.db.get(message.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const isOwner = project.ownerId === user._id;
    const isMember = project.projectMembers?.some(
      (member) => member.userId === user._id
    );

    if (!isOwner && !isMember) {
      throw new Error("Not authorized to react to messages in this project");
    }

    // SERVER-SIDE LOGIC: Check if user already reacted with this emoji
    const existingReaction = await ctx.db
      .query("reactions")
      .withIndex("by_user_and_message", (q) =>
        q.eq("userId", user._id).eq("messageId", args.messageId)
      )
      .filter((q) => q.eq(q.field("emoji"), args.emoji))
      .unique();

    if (existingReaction) {
      // Remove reaction
      await ctx.db.delete(existingReaction._id);
      return { action: "removed", emoji: args.emoji };
    } else {
      // Add reaction with server-side timestamp
      await ctx.db.insert("reactions", {
        messageId: args.messageId,
        userId: user._id,
        emoji: args.emoji,
        timestamp: Date.now(),
      });
      return { action: "added", emoji: args.emoji };
    }
  },
});
