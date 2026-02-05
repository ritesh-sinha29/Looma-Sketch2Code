"use client";

import { useConvexAuth } from "convex/react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const Home = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      toast.dismiss("checking-session");
      toast.success("Session restored successfully!");
      router.push("/auth/callback");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  if (isAuthLoading) {
    // toast.loading("Checking session...", {
    //   id: "checking-session",
    // });
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black text-white">
        <Loader2 className="animate-spin w-5 h-5 inline mr-3" /> Connecting with Looma environment...
      </div>
    );
  }
  return <div className="">go to auth</div>;
};

export default Home;
