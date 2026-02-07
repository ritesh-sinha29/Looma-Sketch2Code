"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Loader2, Bot, BotOff } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface AIToggleButtonProps {
  projectId: Id<"projects">;
}

export function AIToggleButton({ projectId }: AIToggleButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Get current AI status
  const config = useQuery(api.ai.config.getConfig, { projectId });
  const toggleAI = useMutation(api.ai.config.toggleAI);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      await toggleAI({
        projectId,
        enabled: !config?.enabled,
      });
    } catch (error) {
      console.error("Failed to toggle AI:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isEnabled = config?.enabled ?? false;

  return (
    <Button
      onClick={handleToggle}
      disabled={isLoading}
      variant={isEnabled ? "default" : "outline"}
      size="sm"
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isEnabled ? (
        <Bot className="h-4 w-4" />
      ) : (
        <BotOff className="h-4 w-4" />
      )}
      AI {isEnabled ? "On" : "Off"}
    </Button>
  );
}
