"use client";

import { useQuery, useMutation } from "convex/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";

import { useStoreUser } from "@/hooks/user-store";

const AuthCallback = () => {
  const { isAuthenticated, isLoading: isStoreLoading } = useStoreUser();
  const router = useRouter();
  const user = useQuery(api.users.getCurrentUser);

  useEffect(() => {
    if (isStoreLoading) return;

    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    if (user === undefined) return;

    const handleRedirect = async () => {
      if (!user) return;

      await new Promise((resolve) => setTimeout(resolve, 3000));

      if (user.hasCompletedOnboarding) {
        router.replace("/dashboard");
      } else {
        router.replace(`/onboard/${user._id}`);
      }
    };

    handleRedirect();
  }, [isAuthenticated, isStoreLoading, user, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center relative  bg-black">
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120, 180, 255, 0.25), transparent 70%), #000000",
        }}
      />
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center justify-center gap-1.5 h-10 overflow-hidden w-24 relative">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className="h-2.5 w-2.5 rounded-full bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.5)] animate-slide-left absolute left-1/2"
              style={{
                animationDelay: `${index * 200}ms`,
              }}
            />
          ))}
        </div>
        <p className="text-gray-300/80 text-lg absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          Establishing connection with{" "}
          <span className="text-white font-pop">Looma</span>
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
