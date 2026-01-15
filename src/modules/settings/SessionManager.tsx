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
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        await (sessionToRevoke as any).revoke();
        toast.success("Device logged out successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to log out device");
    }
  };

  const handleRevokeAll = async () => {
    try {
      const otherSessions = sessions.filter((s) => s.id !== currentSession?.id);
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      await Promise.all(otherSessions.map((s) => (s as any).revoke()));
      toast.success("All other devices logged out");
    } catch (error) {
      console.error(error);
      toast.error("Failed to log out other devices");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Login Activities
          </h2>
          <p className="text-muted-foreground">
            View and manage devices where you are currently signed in.
          </p>
        </div>
        {sessions.length > 1 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <ShieldAlert className="mr-2 h-4 w-4" />
                Log out all other devices
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will sign you out from all devices except this
                  one. You will need to log in again on those devices.
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
        )}
      </div>

      <div className="grid gap-4">
        {sessions.map((session) => {
          const isCurrent = session.id === currentSession?.id;
          // biome-ignore lint/suspicious/noExplicitAny: Clerk type definition missing latestActivity
          const agent = (session as any).latestActivity;

          return (
            <Card
              key={session.id}
              className={`transition-all ${
                isCurrent ? "border-primary/50 bg-primary/5" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-full">
                      {agent?.isMobile ? (
                        <Smartphone className="h-5 w-5" />
                      ) : (
                        <Laptop className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {agent?.browserName ||
                          agent?.browser_name ||
                          "Unknown Browser"}{" "}
                        on{" "}
                        {agent?.osName || agent?.os_name || "Unknown OS"}
                        {isCurrent && (
                          <Badge variant="default" className="text-xs">
                            This Device
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Globe className="h-3 w-3" />
                        {agent?.city || agent?.city_name || "Unknown City"},{" "}
                        {agent?.country ||
                          agent?.country_name ||
                          "Unknown Country"}{" "}
                        • {agent?.ipAddress || agent?.ip_address || "IP Hidden"}
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
                  <Clock className="h-3 w-3" />
                  Last active:{" "}
                  {formatDistanceToNow(session.lastActiveAt, {
                    addSuffix: true,
                  })}
                </div>

              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
