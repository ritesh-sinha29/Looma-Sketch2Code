import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run presence cleanup every 5 minutes
crons.interval(
  "cleanup stale presence",
  { minutes: 5 },
  internal.presence.cleanupStalePresence
);

// Reset AI daily counters at midnight UTC
crons.daily(
  "reset AI daily counters",
  { hourUTC: 0, minuteUTC: 0 },
  internal.ai.cleanup.resetDailyCounters
);

export default crons;
