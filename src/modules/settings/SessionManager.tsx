"use client";

import { useSession, useSessionList } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import {
  Clock,
  Globe,
  Laptop,
  Loader2,
  LogOut,
  ShieldAlert,
  Smartphone,
} from "lucide-react";
import { UAParser } from "ua-parser-js";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function getSessionAgentInfo(session: any, isCurrent: boolean) {
  // biome-ignore lint/suspicious/noExplicitAny: Clerk type definition missing latestActivity
  const agent = (session as any).latestActivity;
  
  let browserName = agent?.browserName || agent?.browser_name;
  let osName = agent?.osName || agent?.os_name;
  let deviceType = agent?.deviceType || agent?.device_type;

  // Prioritize User Agent parsing for better accuracy (auto-identify)
  const userAgent = agent?.userAgent || (session as any).userAgent;
  
  if (userAgent) {
     const parser = new UAParser(userAgent);
     const result = parser.getResult();
     if (result.browser.name) browserName = result.browser.name;
     if (result.os.name) osName = result.os.name;
     if (result.device.type) deviceType = result.device.type;
  } else if (isCurrent && typeof window !== 'undefined') {
     // Use local navigator for current session if no UA string in session
     const parser = new UAParser(window.navigator.userAgent);
     const result = parser.getResult();
     if (result.browser.name) browserName = result.browser.name;
     if (result.os.name) osName = result.os.name;
     if (result.device.type) deviceType = result.device.type;
  }

  const isMobile = agent?.isMobile || deviceType === "mobile" || deviceType === "tablet";

  // Construct location string
  let location = `${agent?.city || agent?.city_name || "Unknown City"}, ${agent?.country || agent?.country_name || "Unknown Country"}`;
  let ip = agent?.ipAddress || agent?.ip_address || "IP Hidden";
  
  // Handle localhost/dev environment
  if (ip === "127.0.0.1" || ip === "::1" || (isCurrent && typeof window !== 'undefined' && window.location.hostname === 'localhost')) {
     if (location.includes("Unknown")) location = "Local Development";
     if (ip === "IP Hidden") ip = "127.0.0.1";
  }

  return { browserName, osName, isMobile, location, ip };
}

export const SessionManager = () => {
  const { isLoaded, sessions } = useSessionList();
  const { session: currentSession } = useSession();

  if (!isLoaded) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleRevoke = async (sessionId: string) => {
    try {
      const sessionToRevoke = sessions.find((s) => s.id === sessionId);
      if (sessionToRevoke) {
        // biome-ignore lint/suspicious/noExplicitAny: Clerk session.end()
        await (sessionToRevoke as any).end();
        toast.success("Device logged out successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to log out device");
    }
  };

  const handleRevokeAll = async () => {
    try {
      // 1. Revoke all OTHER sessions first so the auth token remains valid for those requests
      const otherSessions = sessions.filter((s) => s.id !== currentSession?.id);
      await Promise.all(otherSessions.map((s) => (s as any).end()));

      // 2. Revoke current session last
      if (currentSession) {
         await (currentSession as any).end();
      }
      
      toast.success("All devices logged out");
    } catch (error) {
      console.error(error);
      toast.error("Failed to log out devices");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mt-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Login Activities
            <Badge variant="outline" className="ml-2">
              {sessions.length} active
            </Badge>
          </h2>
          <p className="text-muted-foreground">
            View and manage devices where you are currently signed in.
          </p>
        </div>
        <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <ShieldAlert className="mr-2 h-4 w-4" />
                Log out all devices
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will sign you out from all devices including this
                  one. You will need to log in again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRevokeAll}>
                  Yes, log out all
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid gap-4">
        {sessions.map((session) => {
          const isCurrent = session.id === currentSession?.id;
          const { browserName, osName, isMobile, location, ip } = getSessionAgentInfo(session, isCurrent);

          return (
            <Card
              key={session.id}
              className={`transition-all ${
                isCurrent ? "border-primary/50 bg-primary/5" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  {/* DEBUG: Remove this before production */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-full">
                      {isMobile ? (
                        <Smartphone className="h-5 w-5" />
                      ) : (
                        <Laptop className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {browserName || "Unknown Browser"}{" "}
                        on{" "}
                        {osName || "Unknown OS"}
                        {isCurrent && (
                          <Badge variant="default" className="text-xs">
                            This Device
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Globe className="h-3 w-3" />
                         {location} • {ip}
                      </CardDescription>
                    </div>
                  </div>
                  {!isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRevoke(session.id)}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-md w-fit">
                  {isCurrent || new Date().getTime() - new Date(session.lastActiveAt).getTime() < 5 * 60 * 1000 ? (
                     <div className="flex items-center gap-2 text-green-600 font-medium">
                        <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                        Active Now
                     </div>
                  ) : (
                    <>
                      <Clock className="h-3 w-3" />
                      Last active:{" "}
                      {formatDistanceToNow(session.lastActiveAt, {
                        addSuffix: true,
                      })}
                    </>
                  )}
                </div>

              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
