"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MessageItem } from "@/components/chat/MessageItem";
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { containerVariants } from "@/lib/animations";

interface MessageListProps {
  projectId: Id<"projects">;
}

export function MessageList({ projectId }: MessageListProps) {
  // SERVER-SIDE DATA: Fully enriched messages from Convex
  const messages = useQuery(api.messages.getMessages, { projectId });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p className="text-lg">No messages yet</p>
        <p className="text-sm">Be the first to say something!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <AnimatePresence mode="popLayout">
        <motion.div
          variants={shouldReduceMotion ? undefined : containerVariants}
          initial="hidden"
          animate="visible"
        >
          {messages.map((message) => (
            <MessageItem key={message._id} message={message} />
          ))}
        </motion.div>
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
}
