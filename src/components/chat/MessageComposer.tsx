"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { EmojiPicker } from "@/components/chat/EmojiPicker";
import { motion, useReducedMotion } from "framer-motion";
import { sendButtonVariants } from "@/lib/animations";

interface MessageComposerProps {
  projectId: Id<"projects">;
}

export function MessageComposer({ projectId }: MessageComposerProps) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const sendMessage = useMutation(api.messages.sendMessage);
  const setTyping = useMutation(api.presence.setTyping);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Debounced typing indicator
  useEffect(() => {
    if (message.length > 0) {
      setTyping({ projectId, isTyping: true });
      const timeout = setTimeout(() => {
        setTyping({ projectId, isTyping: false });
      }, 3000);
      return () => clearTimeout(timeout);
    } else {
      setTyping({ projectId, isTyping: false });
    }
  }, [message, projectId, setTyping]);

  const handleSend = async () => {
    if (message.trim().length === 0) return;

    try {
      await sendMessage({
        projectId,
        text: message.trim(),
      });
      setMessage("");
      setTyping({ projectId, isTyping: false });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emojiId: string) => {
    const emoji = EMOJI_LIST.find((e) => e.id === emojiId);
    if (emoji) {
      setMessage((prev) => prev + emoji.unicode);
      setShowEmojiPicker(false);
      textareaRef.current?.focus();
    }
  };

  const charCount = message.length;
  const maxChars = 5000;
  const isOverLimit = charCount > maxChars;
  const canSend = message.trim().length > 0 && !isOverLimit;

  return (
    <div className="border-t p-4 bg-background">
      <div className="flex gap-2">
        {/* Emoji Picker */}
        <EmojiPicker
          open={showEmojiPicker}
          onOpenChange={setShowEmojiPicker}
          onEmojiSelect={handleEmojiSelect}
        />

        {/* Message Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Shift+Enter for new line)"
            className="min-h-[40px] max-h-[200px] resize-none pr-16"
            rows={1}
          />
          {/* Character Counter */}
          <div
            className={`absolute bottom-2 right-2 text-xs ${
              isOverLimit ? "text-red-500" : "text-muted-foreground"
            }`}
          >
            {charCount}/{maxChars}
          </div>
        </div>

        {/* Send Button */}
        <motion.div
          variants={shouldReduceMotion ? undefined : sendButtonVariants}
          animate={canSend ? "ready" : "idle"}
          whileTap={shouldReduceMotion ? undefined : "tap"}
        >
          <Button
            onClick={handleSend}
            disabled={!canSend}
            size="icon"
            className="size-10 flex-shrink-0"
          >
            <Send className="size-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

// Import EMOJI_LIST for emoji insertion
import { EMOJI_LIST } from "@/lib/emoji-config";
