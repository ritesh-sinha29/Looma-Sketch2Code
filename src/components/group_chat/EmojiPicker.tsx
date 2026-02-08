"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EMOJI_LIST } from "@/lib/emoji-config";
import { Smile } from "lucide-react";

interface EmojiPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmojiSelect: (emojiId: string) => void;
}

export function EmojiPicker({
  open,
  onOpenChange,
  onEmojiSelect,
}: EmojiPickerProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <Smile className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2">
        <div className="grid grid-cols-6 gap-2">
          {EMOJI_LIST.map((emoji) => (
            <Button
              key={emoji.id}
              variant="ghost"
              className="size-12 text-2xl p-0 hover:bg-muted"
              onClick={() => onEmojiSelect(emoji.id)}
              title={emoji.name}
            >
              {emoji.unicode}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
