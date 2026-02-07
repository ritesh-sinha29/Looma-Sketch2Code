// AI Cleanup - Scheduled maintenance

import { internalMutation } from "../_generated/server";

// Reset daily counters at midnight (add to convex/crons.ts)
export const resetDailyCounters = internalMutation({
  handler: async (ctx) => {
    const configs = await ctx.db.query("ai_config").collect();

    for (const config of configs) {
      await ctx.db.patch(config._id, {
        responsesToday: 0,
        updatedAt: Date.now(),
      });
    }

    console.log(`Reset daily counters for ${configs.length} AI configs`);
  },
});
