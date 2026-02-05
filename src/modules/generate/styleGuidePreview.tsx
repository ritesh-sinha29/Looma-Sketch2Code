"use client";
import { useQuery } from "convex/react";
import React from "react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { LucidePaintBucket, MoveRight } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { formatDistanceToNow } from "date-fns";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";

const StyleGuidePreview = () => {
  const savedStyles = useQuery(api.styleGuides.getUserStyleGuides);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          size="sm"
          className="text-xs cursor-pointer gap-2"
        >
          Style Guide <LucidePaintBucket className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0 shadow-xl border-border/50"
        align="start"
      >
        <div className="p-3 border-b bg-muted/30">
          <h4 className="text-xs font-semibold flex items-center gap-2">
            <LucidePaintBucket className="h-3.5 w-3.5 text-primary" />
            Your Style Guides
          </h4>
        </div>

        <div className="max-h-[300px] overflow-y-auto p-2">
          {savedStyles === undefined ? (
            <div className="flex justify-center p-6">
              <Spinner className="h-6 w-6 text-muted-foreground" />
            </div>
          ) : savedStyles.length === 0 ? (
            <div className="text-center py-6 px-4">
              <p className="text-xs text-muted-foreground">
                No style guides saved yet.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {savedStyles.map((style) => (
                <div
                  key={style._id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      <div
                        className="h-6 w-6 rounded-full border-2 border-background ring-1 ring-border/50 shadow-sm"
                        style={{ backgroundColor: style.colors?.primary?.hex }}
                        title="Primary"
                      />
                      <div
                        className="h-6 w-6 rounded-full border-2 border-background ring-1 ring-border/50 shadow-sm"
                        style={{
                          backgroundColor: style.colors?.secondary?.hex,
                        }}
                        title="Secondary"
                      />
                      <div
                        className="h-6 w-6 rounded-full border-2 border-background ring-1 ring-border/50 shadow-sm"
                        style={{ backgroundColor: style.colors?.accent?.hex }}
                        title="Accent"
                      />
                    </div>
                    <span className="text-xs font-medium truncate max-w-[120px]">
                      {style.name || "Untitled Style"}
                    </span>
                  </div>
                 <span>
                    <MoveRight className="h-3.5 w-3.5 text-muted-foreground"/>
                 </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-2 border-t bg-muted/10">
          <Link href="/dashboard/style-guide">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-[10px] h-7 justify-start text-muted-foreground hover:text-primary"
            >
              Manage all styles
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default StyleGuidePreview;
