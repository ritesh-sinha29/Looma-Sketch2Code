# Real-time Collaboration with Liveblocks & Tldraw Implementation

This document outlines how real-time collaborative whiteboarding was implemented in the project using Tldraw, Yjs, and Liveblocks.

## Overview
Users can access a project canvas where multiple team members can draw, edit, and view each other's cursors in real-time. This is achieved without persistent database storage for the canvas state (for now), relying on Liveblocks' real-time room infrastructure.

## Stack
- **Next.js 14+**: Framework (App Router)
- **Tldraw**: Whiteboard library
- **Liveblocks**: Real-time collaboration infrastructure
- **Yjs**: CRDT (Conflict-free Replicated Data Type) used for state synchronization
- **@liveblocks/yjs**: Bridge between Liveblocks and Yjs

## Implementation Details

### 1. The `useYjsStore` Hook
Located at `src/app/(main)/dashboard/projects/[id]/canvas/useYjsStore.ts`.

This custom hook is the core of the integration. It bridges the Tldraw generic store with a Yjs document synced via Liveblocks.
- **Initialization**: Creates a local Tldraw store and a Yjs document.
- **Sync (Yjs -> Store)**: Observes the Yjs map (`tl_1_records`) and applies any changes (add, update, delete) to the local Tldraw store.
- **Sync (Store -> Yjs)**: Listens for user-initiated changes in the Tldraw store and propagates them to the Yjs document.
- **Presence**: Syncs user cursors and selection states using Yjs Awareness and Liveblocks presence.

### 2. The Canvas Component
Located at `src/app/(main)/dashboard/projects/[id]/canvas/Canvas.tsx`.

- Uses the `useYjsStore` hook to get the synced store.
- Renders the `<Tldraw />` component, passing the customized store.

### 3. The Page Wrapper
Located at `src/app/(main)/dashboard/projects/[id]/canvas/page.tsx`.

- Wraps the Canvas with `LiveblocksProvider` and `RoomProvider`.
- **`projectId`** is used as the unique Room ID. This ensures all users on the same project join the same session.
- Handles loading states with `ClientSideSuspense`.

## Usage
1. Provide your `NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY` in the `.env.local` file.
   ```env
   NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_...
   NEXT_PUBLIC_TLDRAW_LICENSE_KEY=...
   ```
2. Navigate to `http://localhost:3000/dashboard/projects/[projectId]/canvas`.
3. Open the same URL in a different browser window or incognito mode to test real-time sync.

## Future Considerations
- **Persistence**: Currently, the data persists only within the Liveblocks room session. To save drawings permanently, you would implement a database sync mechanism (e.g., saving the Yjs doc state to Convex or S3) periodically or on exit.
- **Authentication**: Integrate Liveblocks with your Clerk auth to secure rooms and identify users correctly (currently using public key).
