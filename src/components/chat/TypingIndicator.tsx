"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { motion, useReducedMotion } from "framer-motion";
import { typingDotVariants } from "@/lib/animations";

interface TypingIndicatorProps {
  projectId: Id<"projects">;
}

export function TypingIndicator({ projectId }: TypingIndicatorProps) {
  // SERVER-SIDE: Typing users with auto-expiration
  const typingUsers = useQuery(api.presence.getTypingUsers, { projectId });
  const shouldReduceMotion = useReducedMotion();

  if (!typingUsers || typingUsers.length === 0) {
    return null;
  }

  // Show up to 3 users typing
  const displayUsers = typingUsers.slice(0, 3);
  const remainingCount = typingUsers.length - displayUsers.length;

  const userNames = displayUsers.map((u) => u?.name).filter(Boolean);

  let text = "";
  if (userNames.length === 1) {
    text = `${userNames[0]} is typing`;
  } else if (userNames.length === 2) {
    text = `${userNames[0]} and ${userNames[1]} are typing`;
  } else if (userNames.length === 3) {
    text = `${userNames[0]}, ${userNames[1]}, and ${userNames[2]} are typing`;
  }

  if (remainingCount > 0) {
    text += ` and ${remainingCount} more`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="px-4 py-2 text-sm text-muted-foreground italic flex items-center gap-2"
    >
      <span>{text}</span>
      {!shouldReduceMotion && (
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              variants={typingDotVariants}
              animate="animate"
              transition={{ delay: i * 0.15 }}
              className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
            />
          ))}
        </div>
      )}
      {shouldReduceMotion && <span>...</span>}
    </motion.div>
  );
}
