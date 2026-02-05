"use client";

import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Type,
  Move,
  Palette,
  Layout,
  X,
  Hash,
  Box,
  LucidePaintBucket,
  LucidePaintbrush,
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
  selectedElement: HTMLElement | null;
  clearSelection: () => void;
};

const ElementSetting = ({ selectedElement, clearSelection }: Props) => {
  const [styles, setStyles] = useState({
    fontSize: "16px",
    color: "#000000",
    backgroundColor: "transparent",
    fontWeight: "400",
    letterSpacing: "0px",
    textAlign: "left",
    padding: "0px",
    margin: "0px",
    borderRadius: "0px",
    borderWidth: "0px",
    borderColor: "#000000",
  });

  const [classes, setClasses] = useState<string[]>([]);
  const [newClass, setNewClass] = useState("");

  const textTags = ["P", "H1", "H2", "H3", "H4", "H5", "H6", "SPAN", "A", "LABEL", "LI", "B", "STRONG", "I", "EM", "BUTTON"];
  
  const isTextElement = selectedElement && textTags.includes(selectedElement.tagName);
  const isBoxElement = selectedElement && !["SPAN", "A", "B", "STRONG", "I", "EM"].includes(selectedElement.tagName);

  useEffect(() => {
    if (selectedElement) {
      const computed = window.getComputedStyle(selectedElement);
      setStyles({
        fontSize: computed.fontSize,
        color: rgbToHex(computed.color),
        backgroundColor: rgbToHex(computed.backgroundColor),
        fontWeight: computed.fontWeight,
        letterSpacing: computed.letterSpacing === "normal" ? "0px" : computed.letterSpacing,
        textAlign: computed.textAlign,
        padding: computed.padding,
        margin: computed.margin,
        borderRadius: computed.borderRadius,
        borderWidth: computed.borderWidth,
        borderColor: rgbToHex(computed.borderColor),
      });

      // Get classes, excluding our helper outlines
      const currentClasses = Array.from(selectedElement.classList).filter(
        (c) => !["hover-outline", "selected-outline"].includes(c)
      );
      setClasses(currentClasses);
    }
  }, [selectedElement]);

  const rgbToHex = (rgb: string) => {
    if (!rgb || rgb === "rgba(0, 0, 0, 0)" || rgb === "transparent") return "transparent";
    if (rgb.startsWith("#")) return rgb;
    
    const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
    if (!match) return "#000000";
    
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    const a = match[4];

    if (a === "0") return "transparent";
    
    const toHex = (c: number) => {
      const hex = c.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const applyStyle = (property: string, value: string) => {
    if (selectedElement) {
      // @ts-ignore
      selectedElement.style[property] = value;
      setStyles((prev) => ({ ...prev, [property]: value }));
    }
  };

  const addClass = () => {
    if (!selectedElement || !newClass.trim()) return;
    const classesToAdd = newClass.trim().split(/\s+/);
    classesToAdd.forEach(c => {
      if (c) {
        selectedElement.classList.add(c);
      }
    });
    setClasses(Array.from(selectedElement.classList).filter(
      (c) => !["hover-outline", "selected-outline"].includes(c)
    ));
    setNewClass("");
  };

  const removeClass = (className: string) => {
    if (!selectedElement) return;
    selectedElement.classList.remove(className);
    setClasses(Array.from(selectedElement.classList).filter(
      (c) => !["hover-outline", "selected-outline"].includes(c)
    ));
  };

  if (!selectedElement) {
    return (
      <div className="w-80 border-l bg-white h-full flex items-center justify-center p-6 text-center">
        <div className="space-y-2">
          <Type className="w-12 h-12 mx-auto text-neutral-300" />
          <h2 className="text-base font-semibold capitalize">Select Design mode <LucidePaintbrush className="inline ml-2 -mt-1" size={24} /></h2>
          <p className="text-sm text-neutral-500 font-medium">
            Select an element on the canvas to edit its properties
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className=" h-full flex flex-col animate-in ease-linear duration-200 overflow-y-auto">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-sm font-semibold flex items-center gap-2 capitalize">
            <Layout className="w-4 h-4 text-primary" />
            {selectedElement.tagName.toLowerCase()} Settings
          </h2>
          <span className="text-[10px] text-neutral-400 font-mono">
             {selectedElement.id ? `#${selectedElement.id}` : "No ID"}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={clearSelection}
          title="Close Settings"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Tailwind Classes Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-neutral-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Tailwind Classes
              </span>
            </div>
            
            <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2 border rounded-md bg-neutral-50/50">
              {classes.length === 0 ? (
                <span className="text-[10px] text-neutral-400 italic">No custom classes</span>
              ) : (
                classes.map((c) => (
                  <div key={c} className="flex items-center gap-1 bg-white border border-neutral-200 px-1.5 py-0.5 rounded text-[10px] font-mono group">
                    {c}
                    <button 
                      onClick={() => removeClass(c)} 
                      className="hover:text-red-500 text-neutral-400"
                      title={`Remove class ${c}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <Input
                value={newClass}
                onChange={(e) => setNewClass(e.target.value)}
                placeholder="e.g. text-red-500 mx-auto"
                className="h-8 text-[11px] font-mono"
                onKeyDown={(e) => e.key === "Enter" && addClass()}
              />
              <Button size="sm" className="h-8 text-xs px-2" onClick={addClass}>
                Add
              </Button>
            </div>
          </div>

          <Separator className="bg-neutral-100" />

          {/* Typography Section (Conditional) */}
          {isTextElement && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-neutral-500" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Typography
                </span>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-neutral-600">Font Size</Label>
                <Select
                  value={styles.fontSize}
                  onValueChange={(val) => applyStyle("fontSize", val)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "12px", "14px", "16px", "18px", "20px", "24px", "30px", "36px", "48px", "60px", "72px"
                    ].map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-neutral-600">Text Color</Label>
                <div className="flex gap-2">
                  <div 
                    className="w-9 h-9 rounded-md border shadow-sm shrink-0" 
                    style={{ backgroundColor: styles.color }}
                  />
                  <Input
                    type="text"
                    value={styles.color}
                    onChange={(e) => applyStyle("color", e.target.value)}
                    className="h-9 font-mono text-xs"
                  />
                  <Input
                    type="color"
                    value={styles.color === "transparent" ? "#000000" : styles.color}
                    onChange={(e) => applyStyle("color", e.target.value)}
                    className="w-9 h-9 p-1 cursor-pointer shrink-0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-neutral-600">Alignment</Label>
                <ToggleGroup
                  type="single"
                  value={styles.textAlign}
                  onValueChange={(val) => val && applyStyle("textAlign", val)}
                  className="justify-start border rounded-md p-1 w-fit"
                >
                  <ToggleGroupItem value="left" size="sm" className="h-8 w-8">
                    <AlignLeft className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="center" size="sm" className="h-8 w-8">
                    <AlignCenter className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="right" size="sm" className="h-8 w-8">
                    <AlignRight className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="justify" size="sm" className="h-8 w-8">
                    <AlignJustify className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-neutral-600">Weight</Label>
                  <Select
                    value={styles.fontWeight}
                    onValueChange={(val) => applyStyle("fontWeight", val)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Weight" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="300">300</SelectItem>
                      <SelectItem value="400">400</SelectItem>
                      <SelectItem value="500">500</SelectItem>
                      <SelectItem value="700">700</SelectItem>
                      <SelectItem value="900">900</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-neutral-600">Spacing</Label>
                  <Input
                    value={styles.letterSpacing}
                    onChange={(e) => applyStyle("letterSpacing", e.target.value)}
                    className="h-9 text-xs"
                    placeholder="0px"
                  />
                </div>
              </div>
            </div>
          )}

          {isTextElement && <Separator className="bg-neutral-100" />}

          {/* Box Style Section (Conditional) */}
          {isBoxElement && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-neutral-500" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Box Style
                </span>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-neutral-600">Background</Label>
                <div className="flex gap-2">
                  <div 
                    className="w-9 h-9 rounded-md border shadow-sm shrink-0" 
                    style={{ backgroundColor: styles.backgroundColor === "transparent" ? "white" : styles.backgroundColor }}
                  />
                  <Input
                    type="text"
                    value={styles.backgroundColor}
                    onChange={(e) => applyStyle("backgroundColor", e.target.value)}
                    className="h-9 font-mono text-xs"
                  />
                  <Input
                    type="color"
                    value={styles.backgroundColor === "transparent" ? "#ffffff" : styles.backgroundColor}
                    onChange={(e) => applyStyle("backgroundColor", e.target.value)}
                    className="w-9 h-9 p-1 cursor-pointer shrink-0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-neutral-600">Border</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={styles.borderWidth}
                    onChange={(e) => applyStyle("borderWidth", e.target.value)}
                    className="h-9 text-xs"
                    placeholder="Width (e.g. 1px)"
                  />
                  <div className="flex gap-1">
                    <Input
                      type="color"
                      value={styles.borderColor === "transparent" ? "#000000" : styles.borderColor}
                      onChange={(e) => {
                        applyStyle("borderColor", e.target.value);
                        applyStyle("borderStyle", "solid");
                      }}
                      className="w-9 h-9 p-1 cursor-pointer shrink-0"
                    />
                    <Input
                      value={styles.borderColor}
                      onChange={(e) => applyStyle("borderColor", e.target.value)}
                      className="h-9 text-[10px] font-mono p-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-neutral-600">Radius</Label>
                <Input
                  value={styles.borderRadius}
                  onChange={(e) => applyStyle("borderRadius", e.target.value)}
                  className="h-9 text-xs"
                  placeholder="e.g. 8px or 50%"
                />
              </div>
            </div>
          )}

          {isBoxElement && <Separator className="bg-neutral-100" />}

          {/* Spacing Section (Shown for most things as requested) */}
          <div className="space-y-4 pb-4">
            <div className="flex items-center gap-2">
              <Move className="w-4 h-4 text-neutral-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Spacing
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-neutral-600">Padding</Label>
                <Input
                  value={styles.padding}
                  onChange={(e) => applyStyle("padding", e.target.value)}
                  className="h-9 text-xs"
                  placeholder="e.g. 10px 20px"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-neutral-600">Margin</Label>
                <Input
                  value={styles.margin}
                  onChange={(e) => applyStyle("margin", e.target.value)}
                  className="h-9 text-xs"
                  placeholder="e.g. 10px auto"
                />
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ElementSetting;

