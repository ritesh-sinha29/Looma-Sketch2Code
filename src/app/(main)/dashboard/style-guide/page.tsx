"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { generateStyleGuide } from "@/modules/styleGuide";
import { styleGuideSchema, StyleGuideData } from "@/lib/Static-items";
import { useMutation, useQuery } from "convex/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import {
  LucidePalette,
  LucideLayoutTemplate,
  LucideSave,
  LucideType,
  Upload,
  X,
  LucidePaintRoller,
  LucideLock,
  LucideCloudBackup,
  LucideMenu,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../../convex/_generated/api";
import { Separator } from "@/components/ui/separator";

const ColorCard = ({
  title,
  color,
}: {
  title: string;
  color: { name: string; hex: string };
}) => (
  <div className="">
    <div>
      <div
        className="h-22 w-full rounded-lg shadow-inner border "
        style={{ backgroundColor: color.hex }}
      />

      <div className="space-y-1 mt-1">
        <p className="font-medium text-xs text-muted-foreground uppercase tracking-wider">
          <LucidePaintRoller className="h-4 w-4 inline mr-1" /> {title}
        </p>
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-sm truncate" title={color.name}>
            {color.name}
          </p>
          <p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded w-fit select-all">
            {color.hex}
          </p>
        </div>
      </div>
    </div>
  </div>
);

const MAX_IMAGES = 3;
const MAX_SIZE_MB = 1;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const StyleGuidePage = () => {
  const [images, setImages] = useState<string[]>([]); // max 3 images
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<StyleGuideData | null>(null);

  // Convex Hooks
  const createStyleGuide = useMutation(api.styleGuides.createStyleGuide);
  const savedStyles = useQuery(api.styleGuides.getUserStyleGuides);

  // Dialog State
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [styleName, setStyleName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveStyle = async () => {
    if (!styleName.trim() || !data) return;

    setIsSaving(true);
    try {
      await createStyleGuide({
        name: styleName,
        colors: {
          primary: data.primary,
          secondary: data.secondary,
          accent: data.accent,
          others: data.others,
        },
        fonts: data.fonts,
      });
      toast.success("Style Guide Saved Successfully!");
      setSaveDialogOpen(false);
      setStyleName("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save style guide.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const files = Array.from(input.files || []);

    // Limit count
    if (files.length > MAX_IMAGES) {
      toast.error(`You can upload up to ${MAX_IMAGES} images only.`);
      input.value = "";
      return;
    }

    // Validate size
    const oversized = files.find((file) => file.size > MAX_SIZE_BYTES);
    if (oversized) {
      toast.error(`Each image must be under ${MAX_SIZE_MB} MB.`);
      input.value = "";
      return;
    }

    // Convert to base64 (no upload needed!)
    Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          }),
      ),
    ).then((imgs) => {
      setImages(imgs);
      setData(null); // Reset data on new upload
    });
  };

  const handleGenerate = async () => {
    if (images.length === 0) return;
    setIsLoading(true);
    try {
      const result = await generateStyleGuide(images);
      setData(result);
      toast.success("Style guide generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate style guide. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearImages = () => {
    setImages([]);
    setData(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold capitalize tracking-tight">
          Style Guide Generator
        </h1>
        <p className="text-muted-foreground text-base">
          Upload your inspiration and let AI extract the perfect color palette
          and typography.
        </p>
      </div>

      {/* Upload INPUT AREA */}
      <div className="relative scale-95 hover:scale-100 transition-all duration-300 ">
        <Input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="absolute inset-0 w-full h-80 opacity-0 z-10 cursor-pointer "
        />

        <div className="h-80 w-full rounded-xl border-2 border-dashed border-black/40 hover:border-black/60  bg-muted/50 transition-colors hover:bg-muted/80  overflow-hidden">
          {images.length === 0 ? (
            /* EMPTY STATE */
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center shadow-sm">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-lg font-medium">Click to upload images</p>
                <p className="text-sm text-muted-foreground">
                  Upload up to 3 images (PNG, JPG)
                </p>
              </div>
            </div>
          ) : (
            /* IMAGE PREVIEW STATE */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 h-full">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative rounded-lg overflow-hidden border bg-background"
                >
                  <img
                    src={img}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover rotate-2"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Buttons  */}
      {images.length > 0 && (
        <div className="flex items-center justify-center gap-8">
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            size="sm"
            className="min-w-[160px] text-xs cursor-pointer"
          >
            {isLoading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" /> Analyzing...
              </>
            ) : (
              <>
                Extract Styles <LucidePalette className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={clearImages}
            disabled={isLoading}
            size="sm"
            className="text-xs cursor-pointer"
          >
            Clear <X className="ml-2 h-4 w-4" />
          </Button>

          {data && (
            <Button
              variant="outline"
              onClick={() => setSaveDialogOpen(true)}
              disabled={isLoading}
              size="sm"
              className="text-xs cursor-pointer"
            >
              Save Style <LucideSave className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      )}
      {/* Results Rendering */}
      {data && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="p-2 bg-primary/5 rounded-lg text-primary">
                <LucidePalette className="h-4 w-4" />
              </span>
              Color Palette
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
              <ColorCard title="Primary" color={data.primary} />
              <ColorCard title="Secondary" color={data.secondary} />
              <ColorCard title="Accent" color={data.accent} />
              {data.others
                // .slice(0, 1)
                .map((color: StyleGuideData["others"][number], idx: number) => (
                  <ColorCard key={idx} title="Other" color={color} />
                ))}
            </div>

            {/* {data.others.length > 1 && (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {data.others
                  .slice(1)
                  .map(
                    (color: StyleGuideData["others"][number], idx: number) => (
                      <ColorCard key={idx} title="Other" color={color} />
                    )
                  )}
              </div>
            )} */}
          </div>

          <div className="space-y-6 mt-10">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="p-2 bg-primary/5 rounded-lg text-primary">
                <LucideType className="h-4 w-4" />
              </span>
              Typography
            </h2>

            <div className="grid gap-6 px-6">
              {data.fonts.map(
                (font: StyleGuideData["fonts"][number], idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border bg-card shadow-none flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                        {font.family}
                      </p>
                      <p className="text-xl font-medium">{font.name}</p>

                      {/* Headline preview */}
                      <p
                        className="text-xl font-semibold"
                        style={{ fontFamily: font.name }}
                      >
                        The quick brown fox jumps over the lazy dog
                      </p>
                    </div>
                    <div className="text-4xl text-muted-foreground/20 font-serif">
                      Aa
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      )}

      {/* SAVED COLLECTIONS SECTION */}
      <div className=" pt-10">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
          <div className="p-2 bg-primary/5 rounded-lg text-primary">
            <LucideLayoutTemplate className="h-4 w-4" />
          </div>
          Saved Collections
        </h2>

        {savedStyles === undefined ? (
          <div className="flex justify-center p-10">
            <Spinner className="h-8 w-8 text-muted-foreground" />
          </div>
        ) : savedStyles.length === 0 ? (
          <div className="text-center py-10 bg-muted/30 rounded-xl border border-dashed">
            <p className="text-muted-foreground">No style guides saved yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {savedStyles.map((style) => (
              <Card
                key={style._id}
                className="overflow-hidden hover:shadow-md transition-shadow p-0!"
              >
                <CardHeader className="grid grid-cols-3 hover:grid-cols-[2fr_1fr_1fr] transition-all duration-500! ease-in-out p-0! gap-0! bg-muted">
                  {/* 1 */}
                  <div
                    className="h-16"
                    style={{ backgroundColor: style.colors?.primary?.hex }}
                    title="Primary"
                  />

                  {/* 2 */}
                  <div
                    className="h-16"
                    style={{ backgroundColor: style.colors?.secondary?.hex }}
                    title="Secondary"
                  />
                  {/* 3 */}

                  <div
                    className="h-16"
                    style={{ backgroundColor: style.colors?.accent?.hex }}
                    title="Accent"
                  />
                </CardHeader>
                <CardContent className="py-0! px-4 -mt-3 ">
                  <div className="flex items-center justify-between w-full text-sm capitalize">
                    <p>{style.name}</p>
                    <Button variant="ghost" size="icon-sm" className="cursor-pointer">
                      <LucideMenu className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-xs font-normal text-muted-foreground">
                    <LucideCloudBackup className="h-4 w-4 inline mr-1" />{" "}
                    {formatDistanceToNow(style.createdAt)} ago
                  </span>
                  <Separator className="my-2" />
                </CardContent>
                <CardFooter className="flex flex-col text-left pb-3! px-4 -mt-5 space-y-2">
                  <p className="text-sm text-muted-foreground mr-auto">
                    <LucideType className="h-4 w-4 inline mr-3" />
                    Typography
                  </p>

                  <div className="text-sm text-muted-foreground mr-auto">
                    <p className="truncate">
                      <span className="font-semibold text-foreground">
                        Fonts:
                      </span>{" "}
                      {style.fonts?.map((f: any) => f.name).join(", ")}
                    </p>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Style Guide</DialogTitle>
            <DialogDescription>
              Give your style guide a name to save it to your collection.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={styleName}
                onChange={(e) => setStyleName(e.target.value)}
                placeholder="e.g. Modern Minimalist"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaveDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveStyle}
              disabled={isSaving || !styleName.trim()}
            >
              {isSaving && <Spinner className="mr-2 h-4 w-4" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StyleGuidePage;
