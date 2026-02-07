"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MessageList } from "@/components/chat/MessageList";
import { MessageComposer } from "@/components/chat/MessageComposer";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { OnlineUsersList } from "@/components/chat/OnlineUsersList";
import { AIToggleButton } from "@/components/chat/AIToggleButton";
import { Spinner } from "@/components/ui/spinner";
import { useEffect } from "react";
import { MessageSquare } from "lucide-react";

export default function GroupChatPage() {
  const params = useParams<{ id: Id<"projects"> }>();
  const projectId = params.id;

  const project = useQuery(api.projects.getProjectById, { projectId });
  const updatePresence = useMutation(api.presence.updatePresence);

  // Presence heartbeat: Update every 30 seconds
  useEffect(() => {
    if (!projectId) return;

    // Initial presence update
    updatePresence({ projectId });

    // Set up heartbeat interval
    const interval = setInterval(() => {
      updatePresence({ projectId });
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [projectId, updatePresence]);

  if (project === undefined) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Spinner className="size-10" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <div className="border-b px-3 py-2 bg-background">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="size-3.5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight">{project.projectName}</h1>
              <p className="text-[10px] text-muted-foreground leading-tight">Team Chat</p>
            </div>
          </div>
          <AIToggleButton projectId={projectId} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <MessageList projectId={projectId} />

          {/* Typing Indicator */}
          <TypingIndicator projectId={projectId} />

          {/* Message Composer */}
          <MessageComposer projectId={projectId} />
        </div>

        {/* Online Users Sidebar */}
        <OnlineUsersList projectId={projectId} />
      </div>
    </div>
  );
}
