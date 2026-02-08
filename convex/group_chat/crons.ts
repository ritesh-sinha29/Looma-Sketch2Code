import { cronJobs } from "convex/server";
import { internal } from "../_generated/api";

const crons = cronJobs();

// Run presence cleanup every 5 minutes

crons.interval(
  "cleanup stale presence",
  { minutes: 5 },
  internal.group_chat.presence.cleanupStalePresence
);

export default crons;
