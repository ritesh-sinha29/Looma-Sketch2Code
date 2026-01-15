"use client";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { LucideGithub } from "lucide-react";
import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const AuthPage = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();

  if (isAuthenticated) {
    toast.success("Session restored successfully!");
    router.push("/auth/callback");
    return;
  }

  return (
    <div className="w-full h-screen flex gap-10 p-8 bg-black">
      {/* left side image */}
      <div className="hidden md:block relative overflow-hidden w-[60%] border  border-gray-200/10">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `
          radial-gradient(circle at 50% 100%, rgba(70, 85, 110, 0.5) 0%, transparent 60%),
          radial-gradient(circle at 50% 100%, rgba(99, 102, 241, 0.4) 0%, transparent 70%),
          radial-gradient(circle at 50% 100%, rgba(181, 184, 208, 0.3) 0%, transparent 80%)
        `,
          }}
        />
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={40}
            height={40}
            className=""
          />
          <h1 className="font-pop font-bold text-2xl text-white">Looma</h1>
        </div>

        <div className="absolute left-4 bottom-20">
          <h1 className="text-6xl tracking-tight font-serif font-bold text-gray-300">
            Sketch. Collaborate. Deploy.
          </h1>
          <p className="text-white text-lg mt-3">
            Turn ideas into live products — together, in real time.
          </p>
        </div>
      </div>
      {/* right side form */}
      <div className="flex flex-col flex-1 justify-center items-center h-full">
        <div className="flex flex-col h-auto space-y-4">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={40}
            height={40}
            className="mx-auto"
          />
          <h1 className="text-3xl font-medium text-center text-white">
            Welcome to <span className="font-pop font-bold">Looma</span>
          </h1>
          <h3 className="text-gray-200/70 text-lg text-center">
            Continue using Looma with others using any of the below methods
          </h3>

          <div className="flex items-center px-12">
            <hr className="w-full border border-gray-200/20" />
            <p className="text-gray-200/70 mx-3 text-sm">continue</p>
            <hr className="w-full border border-gray-200/20" />
          </div>

          <div className="flex  items-center justify-center gap-6 my-6">
            <SignInButton>
              <Button
                size="sm"
                className="px-4! w-fit h-9 text-sm font-medium cursor-pointer bg-white text-black hover:bg-white"
              >
                <Image
                  src="/search.png"
                  alt="Google"
                  width={20}
                  height={20}
                  className="mr-3"
                />{" "}
                Continue with Google
              </Button>
            </SignInButton>

            <SignInButton>
              <Button
                size="sm"
                className="px-4! w-fit h-9 text-sm font-medium cursor-pointer bg-white text-black hover:bg-white"
              >
                {" "}
                <LucideGithub className="mr-3 size-5" /> Continue with GitHub
              </Button>
            </SignInButton>
          </div>
        </div>
        <p className="text-center text-gray-200/70 text-xs mt-20">
          By continuing, you agree to our{" "}
          <span className="font-semibold">Terms of Service</span> and{" "}
          <span className="font-semibold">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
