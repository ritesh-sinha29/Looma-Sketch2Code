"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTypewriter } from "react-simple-typewriter";
import { Search } from "lucide-react";

type SearchMode = "search" | "discover";

export default function ProjectSearchBar() {
  const [mode, setMode] = useState<SearchMode>("search");

  const [text] = useTypewriter({
    words: [
      "Search productivity dashboards...",
      "Find fintech SaaS projects...",
      "Discover edutech platforms...",
      "Explore landing pages...",
      "Search CRM web apps...",
    ],
    loop: true,
    delaySpeed: 2000,
  });

  return (
    <div className="flex w-full max-w-2xl items-center gap-3 rounded-xl border-none bg-background p-0! shadow-none">
      {/* Mode Toggle */}
      <Select
        value={mode}
        onValueChange={(value) => setMode(value as SearchMode)}
      >
        <SelectTrigger className="w-[140px] text-xs tracking-tight p-1.5! bg-muted">
          <SelectValue placeholder="Mode" className="text-xs tracking-tight"/>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="search" className="text-xs!">Search Projects</SelectItem>
          <SelectItem value="discover" className="text-xs">Discover Projects</SelectItem>
        </SelectContent>
      </Select>

      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-8 h-8.5 bg-muted"
          placeholder={text}
        />
      </div>
    </div>
  );
}
