"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { presenceBadgeVariants } from "@/lib/animations";

interface OnlineUsersListProps {
  projectId: Id<"projects">;
}

export function OnlineUsersList({ projectId }: OnlineUsersListProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // SERVER-SIDE: Online users with presence calculation
  const onlineUsers = useQuery(api.presence.getOnlineUsers, { projectId });

  if (isCollapsed) {
    return (
      <motion.div
        initial={shouldReduceMotion ? undefined : { width: 320, opacity: 1 }}
        animate={shouldReduceMotion ? undefined : { width: 48, opacity: 1 }}
        exit={shouldReduceMotion ? undefined : { width: 320, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-12 border-l flex flex-col items-center py-4"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          className="size-8"
        >
          <ChevronRight className="size-4 rotate-180" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={shouldReduceMotion ? undefined : { width: 0, opacity: 0 }}
      animate={shouldReduceMotion ? undefined : { width: 320, opacity: 1 }}
      exit={shouldReduceMotion ? undefined : { width: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-80 border-l flex flex-col bg-muted/20"
    >
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-sm">
          Team Members ({onlineUsers?.length || 0})
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(true)}
          className="size-8"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* User List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          <AnimatePresence mode="popLayout">
            {onlineUsers?.map((presence, index) => (
              <motion.div
                key={presence.userId}
                initial={shouldReduceMotion ? undefined : { opacity: 0, x: -20 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {/* Avatar with status indicator */}
                <div className="relative">
                  <Avatar className="size-10">
                    <AvatarImage src={presence.user?.imageUrl} />
                    <AvatarFallback>
                      {presence.user?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online/Offline Dot */}
                  <AnimatePresence>
                    {presence.isOnline && (
                      <motion.div
                        variants={shouldReduceMotion ? undefined : presenceBadgeVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-background bg-green-500"
                      />
                    )}
                  </AnimatePresence>
                  {!presence.isOnline && (
                    <div className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-background bg-gray-400" />
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {presence.user?.name}
                  </p>
                  {presence.isOnline ? (
                    <p className="text-xs text-green-600">Online</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Last seen{" "}
                      {formatDistanceToNow(presence.lastActive, {
                        addSuffix: true,
                      })}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </motion.div>
  );
}
