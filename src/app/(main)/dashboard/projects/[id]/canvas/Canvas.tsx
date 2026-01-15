"use client";

import { useYjsStore } from "./useYjsStore";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";

const Canvas = () => {
    const store = useYjsStore({
        roomId: "any", // RoomID is managed by RoomProvider above context
    });

  return (
    <div className="h-[calc(100vh-65px)] overflow-auto p-1">
      <Tldraw
        licenseKey={process.env.NEXT_PUBLIC_TLDRAW_LICENSE_KEY}
        store={store}
        onMount={(editor) => {
          // editor.user.updateUserPreferences({
          //   name: "User",
          // }); // Can set user details here if needed
        }}
      />
    </div>
  );
};

export default Canvas;


  // editor.user.updateUserPreferences({
          //   name: "User",
          // }); // Can set user details here if needed