"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useEffect } from "react";

/**
 * AdminSync handles the silent synchronization of the admin's details 
 * from Clerk to the Convex database upon landing on the admin dashboard.
 */
export default function AdminSync() {
  const syncUser = useMutation(api.users.createAdmin);

  useEffect(() => {
    // Run the sync once when the component mounts
    syncUser()
      .then(() => console.log("Admin details synced to DB successfully."))
      .catch((err) => console.error("Admin sync failed:", err));
  }, [syncUser]);

  return null; // Side-effect component, renders nothing
}
