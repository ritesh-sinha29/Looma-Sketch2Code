"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Check, Loader2, Play, Code2, Eye, RefreshCw } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { generateUICode } from "@/modules/Generate-Code/generate-ui-code";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";

interface StyleColor {
  name: string;
  hex: string;
}

interface StyleFont {
  name: string;
  family: string;
}

interface Element {
  label: string;
  type: string;
  action: string;
}

interface UIStructure {
  sectionName: string;
  purpose: string;
  elements: Element[];
}

interface Component {
  type: string;
  label: string;
  props: string | object;
  layout: string;
}

interface GeneratedCode {
  styleGuide: {
    primary: StyleColor;
    secondary: StyleColor;
    accent: StyleColor;
    others: StyleColor[];
    fonts: StyleFont[];
  };
  uiStructure: UIStructure[];
  components: Component[];
  summary: string;
}

export default function GeneratePage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const projectId = params.id as Id<"projects"> | undefined;
  
  // Query project to check for existing code
  const project = useQuery(
    api.projects.getProjectById,
    projectId ? { projectId } : "skip"
  );
  const saveCode = useMutation(api.generatedCode.saveGeneratedCode);
  
  const [analysisData, setAnalysisData] = useState<GeneratedCode | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userDescription, setUserDescription] = useState("");

  useEffect(() => {
    // Check if project has existing generated code in database
    if (project?.generatedCode) {
      // Load from database
      setAnalysisData(project.generatedCode.analysisData);
      setGeneratedCode(project.generatedCode.code);
      setUserDescription(project.generatedCode.description);
      console.log("Loaded existing code from database");
      return;
    }

    // Otherwise, check sessionStorage for new generation
    const storedData = sessionStorage.getItem("generatedCode");
    const storedDescription = sessionStorage.getItem("generatedDescription");
    
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setAnalysisData(parsedData);
        
        // Auto-generate code immediately after loading analysis data
        const description = storedDescription || "Generate a beautiful UI component";
        setUserDescription(description);
        
        // Trigger auto-generation
        setTimeout(() => {
          handleAutoGenerate(parsedData, description);
        }, 100);
      } catch (error) {
        console.error("Failed to parse generated code:", error);
      }
    }
  }, [project]);

  const handleAutoGenerate = async (data: GeneratedCode, description: string) => {
    setIsGenerating(true);
    try {
      const result = await generateUICode({
        analysisData: data,
        userDescription: description,
      });

      if (result.success && result.code) {
        setGeneratedCode(result.code);
        
        // Save to database
        if (projectId) {
          await saveCode({
            projectId,
            code: result.code,
            description,
            analysisData: data,
          });
          console.log("Code saved to database");
        }
        
        toast.success("Production code generated!");
      } else {
        toast.error("Failed to generate code");
      }
    } catch (error) {
      console.error("Code generation error:", error);
      toast.error("An error occurred while generating code");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!analysisData) return;

    setIsGenerating(true);
    try {
      const result = await generateUICode({
        analysisData,
        userDescription: userDescription || "Generate a beautiful UI component",
      });

      if (result.success && result.code) {
        setGeneratedCode(result.code);
        toast.success("Production code generated!");
      } else {
        toast.error("Failed to generate code");
      }
    } catch (error) {
      console.error("Code generation error:", error);
      toast.error("An error occurred while generating code");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy");
    }
  };

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No data found</h2>
          <p className="text-gray-600 mb-4">Please generate code from the canvas first.</p>
          <Button asChild>
            <Link href={`/dashboard/projects/${projectId}/canvas`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Canvas
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal Header  */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/dashboard/projects/${projectId}/canvas`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            
            {generatedCode && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => copyToClipboard(generatedCode)}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isGenerating ? (
          // Loading State
          <div className="flex flex-col items-center justify-center min-h-[600px]">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Generating your code...</h2>
            <p className="text-gray-600">This will take just a few seconds</p>
          </div>
        ) : generatedCode ? (
          // Code/Preview Tabs - Claude Artifacts Style
          <Tabs defaultValue="code" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-2">
                <Code2 className="h-4 w-4" />
                Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="mt-0">
              <div className="bg-white rounded-lg border border-gray-200 p-8 min-h-[600px]">
                <div className="max-w-4xl mx-auto">
                  <div className="mb-4 text-center">
                    <p className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      ⚠️ <strong>Preview Mode:</strong> For security reasons, live preview will be available in a future update. 
                      Please copy the code and test it in your development environment.
                    </p>
                  </div>
                  <pre className="bg-gray-900 text-gray-100 rounded-lg p-6 overflow-auto text-sm border border-gray-700">
                    <code>{generatedCode}</code>
                  </pre>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="code" className="mt-0">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-800 text-gray-100 px-4 py-2 flex items-center justify-between">
                  <span className="text-sm font-mono">Component.tsx</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(generatedCode)}
                    className="text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="bg-gray-900 text-gray-100 p-6 overflow-auto max-h-[800px]">
                  <pre className="text-sm">
                    <code>{generatedCode}</code>
                  </pre>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          // Fallback if auto-generation didn't trigger
          <div className="flex flex-col items-center justify-center min-h-[600px]">
            <p className="text-gray-600">No code generated yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}