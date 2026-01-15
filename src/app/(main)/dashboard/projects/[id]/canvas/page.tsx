"use client";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { useParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import Canvas from "./Canvas";

const ProjectCanvas = () => {
    const params = useParams();
    const projectId = params.id as string;

  return (
    <LiveblocksProvider publicApiKey={process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!}>
      <RoomProvider id={projectId} initialPresence={{ cursor: null }}>
        <ClientSideSuspense fallback={<div className="h-full w-full flex items-center justify-center"><Spinner /></div>}>
          <Canvas />
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
};

export default ProjectCanvas;
