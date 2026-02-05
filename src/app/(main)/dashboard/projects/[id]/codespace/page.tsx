"use client";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { Code, LucideExternalLink, Sparkles } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import React from "react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { Spinner } from "@/components/ui/spinner";

const CodespacePage = () => {
  const param = useParams();
  const projectId = param.id as Id<"projects">;
  const allCodes = useQuery(api.projects.getCodespaces, { projectId });
  return (
    <div className="p-6">
      <div className="flex items-start justify-between ">
        <div className="flex flex-col space-y-1">
          <h1 className="text-3xl font-semibold">
            Codespace <Code className="size-6 ml-2 inline" />
          </h1>
          <p className="text-base text-muted-foreground">
            Manage your all generated codes here
          </p>
        </div>

        <Link href={`/dashboard/projects/${projectId}/generate`}>
          <Button
            className="bg-blue-500 text-white hover:bg-blue-600 text-xs cursor-pointer"
            size="sm"
          >
            Generate New <LucideExternalLink />
          </Button>
        </Link>
      </div>
      {allCodes === undefined ? (
        <div className="flex items-center justify-center p-20">
         <Spinner className="size-10"/>
        </div>
      ) : allCodes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {allCodes.map((code) => (
            <div
              key={code._id}
              className="group border border-border/50 rounded-xl p-5 bg-card/50 hover:bg-card hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Code className="size-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                    Generated Component
                  </h3>
                  <div className="bg-muted/50 rounded-md p-3 max-h-40 overflow-hidden relative">
                    <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap">
                      {code.code}
                    </pre>
                    <div className="absolute inset-0 bg-linear-to-t from-muted/80 to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                <Button variant="ghost" size="sm" className="text-xs">
                  View Full Code
                </Button>
                <div className="text-[10px] text-muted-foreground">
                  {new Date(code._creationTime).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-muted-foreground/20 rounded-xl bg-muted mt-10 p-10 text-center animate-in fade-in zoom-in duration-700">
          <div className="relative mb-6">
            <div className="relative size-20 bg-primary-foreground border rounded-lg flex items-center justify-center shadow-inner">
              <Code className="size-10 text-blue-500" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-foreground mb-3">
            No Generated Code Yet
          </h2>
          <p className="text-muted-foreground mb-8 max-w-sm text-balance text-sm">
            Your codespace is currently empty. Bring your ideas to life by
            generating your first component with our AI agent.
          </p>

          <Link href={`/dashboard/projects/${projectId}/generate`}>
            <Button className="cursor-pointer">
              Generate Now
              <Sparkles className="size-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CodespacePage;
