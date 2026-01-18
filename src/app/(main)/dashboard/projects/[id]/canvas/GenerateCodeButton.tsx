import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LucideSparkles, Loader2, RefreshCw } from "lucide-react";
import { Editor, TLShape } from "tldraw";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { generateCode } from "@/modules/Generate-Code/canvas-analysis";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";


export function GenerateCodeButton({ editor }: { editor: Editor }) {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as Id<"projects">;
  
  // Query project to check if code already exists
  const project = useQuery(
    api.projects.getProjectById,
    projectId ? { projectId } : "skip"
  );
  
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  
  const hasGeneratedCode = !!project?.generatedCode;

  const handleGenerate = async () => {
    if (!editor) return;
    if (!description.trim()) {
      toast.error("Please provide a description");
      return;
    }

    setLoading(true);
    try {
      // Extract shape data directly from tldraw
      const shapes = editor.getCurrentPageShapes();
      
      console.log(`Extracting ${shapes.length} shapes from canvas...`);

      if (shapes.length === 0) {
        throw new Error("No content to generate from");
      }

      // Transform shapes to clean, structured JSON
      const canvasData = shapes.map((shape: TLShape) => {
        // Type-safe property access using 'as any' for props since TLShape is a union type
        const props = shape.props as any;
        
        return {
          id: shape.id,
          type: shape.type,
          position: { 
            x: Math.round(shape.x), 
            y: Math.round(shape.y) 
          },
          size: ['geo', 'frame', 'image'].includes(shape.type)
            ? { 
                width: Math.round(props.w || 0), 
                height: Math.round(props.h || 0) 
              }
            : null,
          properties: {
            // Common properties
            text: props.text || '',
            color: props.color,
            fill: props.fill,
            // Geo shapes
            geo: props.geo, // "rectangle", "ellipse", "triangle", etc.
            // Text properties
            font: props.font,
            size: props.size,
            align: props.align,
            // Visual
            opacity: shape.opacity,
          },
          // Hierarchy & ordering
          parentId: shape.parentId,
          index: shape.index,
          rotation: shape.rotation,
        };
      });

      // Get viewport bounds for context
      const viewport = editor.getViewportPageBounds();

      // Send to server
      const result = await generateCode({
        shapes: canvasData,
        description: description,
        viewport: {
          width: Math.round(viewport.width),
          height: Math.round(viewport.height),
        }
      });
      
      console.log("Generated Analysis:", result);
      
      // Store result and description in sessionStorage for the generate page
      sessionStorage.setItem("generatedCode", JSON.stringify(result));
      sessionStorage.setItem("generatedDescription", description);
      
      toast.success("Analysis generated! Redirecting...");
      setOpen(false);
      
      // Navigate to generate page
      router.push(`/dashboard/projects/${projectId}/generate?projectId=${projectId}`);

    } catch (error) {
      console.error("Generation failed:", error);
      toast.error("Failed to generate code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="ml-2 cursor-pointer z-50 rounded-full bg-white hover:bg-gray-100 px-4 gap-2"
          title={hasGeneratedCode ? "Regenerate Code with AI" : "Generate Code with AI"}
        >
          {hasGeneratedCode ? (
            <>
              <RefreshCw className="size-4 text-black" />
              <span className="text-black">Regenerate Code</span>
            </>
          ) : (
            <>
              <LucideSparkles className="size-4 text-black" />
              <span className="text-black">Generate Code</span>
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{hasGeneratedCode ? "Regenerate Code" : "Generate Code"}</DialogTitle>
          <DialogDescription>
            Provide a short description of your UI
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Textarea
            placeholder="e.g., A login form with email and password fields..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            className="w-full"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

