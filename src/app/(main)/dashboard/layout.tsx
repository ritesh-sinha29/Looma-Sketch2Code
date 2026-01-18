"use client";

import { useStoreUser } from "@/hooks/user-store";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@convex/_generated/api";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/modules/dashboard/appsidebar";
import { DashboardBreadcrumbs } from "@/modules/dashboard/BreadCrumbs";
import { RedirectToSignIn, UserButton } from "@clerk/clerk-react";
import { Separator } from "@/components/ui/separator";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isLoading: isStoreLoading } = useStoreUser();
  const user = useQuery(api.users.getCurrentUser);
  const router = useRouter();

  useEffect(() => {
    if (user === undefined) return;

    if (user && !user.hasCompletedOnboarding) {
      router.push(`/onboard/${user._id}`);
    }
  }, [isStoreLoading, user, router]);

  return (
    <>
      <Unauthenticated>
        <RedirectToSignIn />
      </Unauthenticated>

      <div>
        <Authenticated>
          <SidebarProvider defaultOpen={true}>
            <AppSidebar />
            <SidebarInset>
              <header className="flex justify-between h-16 py-1 shrink-0 items-center border-b px-4">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="-ml-1 cursor-pointer hover:scale-105 transition-all duration-200" />
                  <Separator orientation="vertical" className="mx-0 h-12! bg-gray-400!" />
                  <DashboardBreadcrumbs />
                </div>
                <div>
                  <UserButton/>
                </div>
              </header>
              <main className="flex-1 overflow-auto">{children}</main>
            </SidebarInset>
          </SidebarProvider>
        </Authenticated>
      </div>
    </>
  );
}
