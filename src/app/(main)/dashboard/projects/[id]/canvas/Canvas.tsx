"use client";

import { useYjsStore } from "./useYjsStore";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import { useUser } from "@clerk/nextjs";
import { useMemo, useState } from "react";
import { CollaboratorAvatars } from "./CollaboratorAvatars";
import { useUpdateMyPresence } from "@liveblocks/react/suspense";
import { LiveCursors } from "./LiveCursors";
import { useParams } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { GenerateCodeButton } from "./GenerateCodeButton";
import { Button } from "@/components/ui/button";

const Canvas = () => {
  const { user, isLoaded } = useUser();
  const updateMyPresence = useUpdateMyPresence();
  const params = useParams();
  const projectId = params.id as Id<"projects">;
  // query project data
  const project = useQuery(api.projects.getProjectById, {
    projectId: projectId,
  });

  const inviteLink = project?.inviteLink;

  const userInfo = useMemo(() => {
    if (!user) return undefined;
    const name = user.fullName || user.username || "Anonymous";
    return {
      id: user.id,
      name: name,
      color: stringToColor(user.id),
      avatar: user.imageUrl,
    };
  }, [user]);

  if (!isLoaded) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        Loading user...
      </div>
    );
  }

  const [editor, setEditor] = useState<any>(null);

  const store = useYjsStore({
    roomId: "any",
    userInfo: userInfo ?? { id: "anon", name: "Anonymous", color: "#000000" },
  });

  return (
    <div className="h-[calc(100vh-65px)] overflow-auto p-1 relative">
      <div className="absolute top-2 left-1/2 -translate-x-1/2 scale-75 flex items-center gap-2 z-50">
        <CollaboratorAvatars inviteLink={inviteLink!} />
        <GenerateCodeButton editor={editor} />
      </div>
      <Tldraw
        licenseKey={process.env.NEXT_PUBLIC_TLDRAW_LICENSE_KEY}
        store={store}
        onMount={(editorInstance) => {
          setEditor(editorInstance);
          // Set initial user preferences locally
          if (userInfo) {
            editorInstance.user.updateUserPreferences({
              name: userInfo.name,
              color: userInfo.color,
              id: userInfo.id,
            });
          }

          // Broadcast cursor presence
          editorInstance.on("event", (e: any) => {
            if (e.name === "pointer_move") {
              const { x, y } = editorInstance.inputs.currentPagePoint;
              updateMyPresence({ cursor: { x, y } });
            }
          });
        }}
      >
        <LiveCursors />
      </Tldraw>
    </div>
  );
};

function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
}

export default Canvas;
