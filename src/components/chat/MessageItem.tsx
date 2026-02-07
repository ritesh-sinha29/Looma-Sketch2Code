"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Pencil, Trash2, Bot } from "lucide-react";
import { useState } from "react";
import { EmojiPicker } from "@/components/chat/EmojiPicker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, useReducedMotion } from "framer-motion";
import {
  messageVariants,
  messageVariantsReduced,
  messageHoverVariants,
  reactionVariants,
} from "@/lib/animations";
import { getEmojiById } from "@/lib/emoji-config";

interface MessageItemProps {
  message: {
    _id: Id<"messages">;
    text: string;
    timestamp: number;
    isEdited?: boolean;
    editedAt?: number;
    isAI?: boolean;
    user: {
      _id: Id<"users"> | undefined;
      name: string;
      imageUrl?: string;
    };
    reactionCounts: Record<string, number>;
  };
}

export function MessageItem({ message }: MessageItemProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const toggleReaction = useMutation(api.reactions.toggleReaction);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const shouldReduceMotion = useReducedMotion();

  // Get current user to check permissions
  const currentUser = useQuery(api.users.getCurrentUser);

  const isAuthor = currentUser?._id === message.user._id;

  const handleEmojiSelect = async (emojiId: string) => {
    await toggleReaction({
      messageId: message._id,
      emoji: emojiId,
    });
    setShowEmojiPicker(false);
  };

  const handleDelete = async () => {
    await deleteMessage({ messageId: message._id });
  };

  const variants = shouldReduceMotion ? messageVariantsReduced : messageVariants;
  const isAIMessage = message.isAI || false;

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
     exit="exit"
      layout
      className={`group flex gap-3 hover:bg-muted/50 p-2 rounded-lg transition-colors ${
        isAIMessage ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
      }`}
    >
      {/* User Avatar */}
      <Avatar className="size-10 flex-shrink-0">
        <AvatarImage src={message.user.imageUrl} />
        <AvatarFallback>{message.user.name.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        {/* User name and timestamp */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-semibold text-sm">{message.user.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
          </span>
          {message.isEdited && (
            <span className="text-xs text-muted-foreground italic">
              (edited)
            </span>
          )}
          {isAIMessage && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Bot className="h-3 w-3" />
              AI
            </span>
          )}
        </div>

        {/* Message text */}
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.text}
        </p>

        {/* Reactions */}
        {Object.keys(message.reactionCounts).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(message.reactionCounts).map(([emojiId, count]) => {
              const emojiConfig = getEmojiById(emojiId);
              const displayEmoji = emojiConfig?.unicode || emojiId;
              
              return (
                <motion.button
                  key={emojiId}
                  variants={shouldReduceMotion ? undefined : reactionVariants}
                  initial="initial"
                  animate="animate"
                  whileHover={shouldReduceMotion ? undefined : "hover"}
                  whileTap={shouldReduceMotion ? undefined : "tap"}
                  onClick={() => handleEmojiSelect(emojiId)}
                  className="h-6 px-2 text-xs border rounded-md hover:bg-muted transition-colors"
                >
                  <span className="mr-1">{displayEmoji}</span>
                  <span>{count}</span>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions (show on hover) */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-start gap-1">
        {/* Emoji Picker */}
        <EmojiPicker
          open={showEmojiPicker}
          onOpenChange={setShowEmojiPicker}
          onEmojiSelect={handleEmojiSelect}
        />

        {/* More actions */}
        {isAuthor && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDelete}>
                <Trash2 className="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </motion.div>
  );
}
