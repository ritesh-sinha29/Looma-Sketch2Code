import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Save generated code to a project
export const saveGeneratedCode = mutation({
  args: {
    projectId: v.id("projects"),
    code: v.string(),
    description: v.string(),
    analysisData: v.any(),
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

    // Update the project with generated code
    await ctx.db.patch(args.projectId, {
      generatedCode: {
        code: args.code,
        description: args.description,
        analysisData: args.analysisData,
        generatedAt: Date.now(),
      },
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
