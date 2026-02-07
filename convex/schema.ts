import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(), //clerk user ID for auth
    email: v.string(),
    imageUrl: v.optional(v.string()),
    hasCompletedOnboarding: v.optional(v.boolean()),
    githubUsername: v.optional(v.string()),
    preferedTheme: v.optional(
      v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
    ),
    // PLAN TYPE
    type: v.optional(
      v.union(v.literal("free"), v.literal("pro"), v.literal("elite")),
    ),
    // PROJECT LIMIT
    limit: v.optional(v.union(v.literal(3), v.literal(6), v.literal(12))),
    // ROLES
    usersType: v.optional(v.union(v.literal("user"), v.literal("admin"))),
    createdAt: v.number(),
    updatedAt: v.number(),
    //   INDEXES.....
  }).index("by_token", ["tokenIdentifier"]),

  projects: defineTable({
    projectName: v.string(),
    projectDescription: v.optional(v.string()),
    projectTags: v.optional(v.array(v.string())), // min 2 max 5
    ownerId: v.id("users"),
    ownerEmail: v.string(),
    inviteCode: v.optional(v.string()),
    inviteLink: v.optional(v.string()), // auto creates random invite link unique !
    isPublic: v.boolean(),
    // Now we store id + avatar
    projectMembers: v.optional(
      v.array(
        v.object({
          userId: v.id("users"),
          avatar: v.string(),
        }),
      ),
    ),
    generatedCode: v.optional(
      v.object({
        code: v.string(),
        description: v.string(),
        analysisData: v.any(),
        generatedAt: v.number(),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_invite_code", ["inviteCode"]),

  // Style guide table
  styleGuides: defineTable({
    name: v.string(),
    userId: v.id("users"),
    colors: v.optional(v.any()), // just to make sure it properly stores without Error !
    fonts: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // CODESPACE TABLE LINKED TO PROJECT.
  codespaces: defineTable({
    projectId: v.id("projects"),
    createdBy: v.id("users"),
    updatedBy: v.optional(v.id("users")),
    codespaceName: v.optional(v.string()),
    codespaceDescription: v.optional(v.string()),
    code: v.optional(v.string()),
    messageHistory: v.optional(v.array(v.any())),
    // codespaceTeamTags: v.optional(v.array(v.string())), // Future addition.
    updatedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_updated_by", ["updatedBy"])
    .index("by_created_by", ["createdBy"]),


// approve / reject / versioning table

componentVersions: defineTable({
  projectId: v.id("projects"),
  componentName: v.string(),
  componentCode: v.string(),
  createdBy: v.id("users"),
  createdAt: v.number(),
  version: v.number(),
  isApproved: v.boolean(),
  approvedBy: v.optional(v.id("users")),
  approvedAt: v.optional(v.number()),
  description: v.optional(v.string()),
})
  .index("by_component", ["projectId", "componentName"])
  .index("by_creator", ["createdBy"]),

changeRequests: defineTable({
  projectId: v.id("projects"),
  componentName: v.string(),
  currentVersionId: v.optional(v.id("componentVersions")),
  proposedVersionId: v.id("componentVersions"),
  requestedBy: v.id("users"),
  requestedAt: v.number(),
  status: v.union(
    v.literal("pending"),
    v.literal("approved"),
    v.literal("rejected")
  ),
  reviewedBy: v.optional(v.id("users")),
  reviewedAt: v.optional(v.number()),
  reviewComments: v.optional(v.string()),
  linesAdded: v.number(),
  linesRemoved: v.number(),
})
  .index("by_status", ["projectId", "status"])
  .index("by_requester", ["requestedBy"]),

// REAL-TIME CHAT TABLES

// Messages table - stores all chat messages for each project
messages: defineTable({
  projectId: v.id("projects"),
  userId: v.id("users"),
  text: v.string(),
  timestamp: v.number(),
  isEdited: v.optional(v.boolean()),
  editedAt: v.optional(v.number()),
  // AI-related fields
  isAI: v.optional(v.boolean()),
  aiMetadata: v.optional(v.object({
    confidenceScore: v.number(),
    engagementReason: v.string(),
    contextMessageIds: v.array(v.id("messages")),
    promptTokens: v.number(),
    completionTokens: v.number(),
  })),
})
  .index("by_project", ["projectId"])
  .index("by_project_timestamp", ["projectId", "timestamp"])
  .index("by_user", ["userId"]),

// Reactions table - stores emoji reactions to messages
reactions: defineTable({
  messageId: v.id("messages"),
  userId: v.id("users"),
  emoji: v.string(),
  timestamp: v.number(),
})
  .index("by_message", ["messageId"])
  .index("by_user_and_message", ["userId", "messageId"]),

// Presence table - tracks online status and typing indicators
presence: defineTable({
  userId: v.id("users"),
  projectId: v.id("projects"),
  isOnline: v.boolean(),
  isTyping: v.boolean(),
  lastActive: v.number(),
})
  .index("by_project", ["projectId"])
  .index("by_user_and_project", ["userId", "projectId"])
  .index("by_last_active", ["lastActive"]),

// AI Configuration table - manages AI settings per project
ai_config: defineTable({
  projectId: v.id("projects"),
  enabled: v.boolean(),
  lastResponseAt: v.optional(v.number()),
  responsesToday: v.number(),
  responseFrequency: v.union(
    v.literal("conservative"),
    v.literal("moderate"),
    v.literal("active")
  ),
  engagementThreshold: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_project", ["projectId"])
  .index("by_enabled", ["enabled"]),

// AI Analytics table - tracks AI performance metrics
ai_analytics: defineTable({
  projectId: v.id("projects"),
  date: v.string(), // YYYY-MM-DD
  totalMessages: v.number(),
  aiResponses: v.number(),
  averageConfidence: v.number(),
  engagementReasons: v.object({
    question: v.number(),
    technical: v.number(),
    discussion: v.number(),
  }),
})
  .index("by_project_date", ["projectId", "date"]),

});