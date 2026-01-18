"use server";

import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

interface CanvasShape {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number } | null;
  properties: {
    text?: string;
    color?: string;
    fill?: string;
    geo?: string;
    font?: string;
    size?: string;
    align?: string;
    opacity?: number;
  };
  parentId?: string;
  index?: string;
  rotation?: number;
}

interface GenerateCodeInput {
  shapes: CanvasShape[];
  description: string;
  viewport: { width: number; height: number };
}

/* ------------------ STRICT SCHEMAS FOR OPENAI ------------------ */
// NO .default(), NO .optional(), NO z.any() - OpenAI requires all fields

const StyleColorSchema = z.object({
  name: z.string(),
  hex: z.string(),
});

const StyleFontSchema = z.object({
  name: z.string(),
  family: z.string(),
});

const ElementSchema = z.object({
  label: z.string(),
  type: z.string(),
  action: z.string(),
});

const UIStructureSchema = z.object({
  sectionName: z.string(),
  purpose: z.string(),
  elements: z.array(ElementSchema),
});

const ComponentSchema = z.object({
  type: z.string(),
  label: z.string(),
  props: z.string(), // JSON string instead of z.record()
  layout: z.string(),
});

const CanvasAnalysisSchema = z.object({
  styleGuide: z.object({
    primary: StyleColorSchema,
    secondary: StyleColorSchema,
    accent: StyleColorSchema,
    others: z.array(StyleColorSchema),
    fonts: z.array(StyleFontSchema),
  }),
  uiStructure: z.array(UIStructureSchema),
  components: z.array(ComponentSchema),
  summary: z.string(),
});

/* ------------------ MAIN FUNCTION ------------------ */

export async function generateCode(input: GenerateCodeInput) {
  const { shapes, description, viewport } = input;

  if (!shapes || shapes.length === 0) {
    throw new Error("No shapes provided");
  }

  if (!description) {
    throw new Error("Missing description");
  }

  console.log(`Processing ${shapes.length} shapes...`);

  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: CanvasAnalysisSchema,
      messages: [
        {
          role: "system",
          content: `You are an expert Frontend Architect and UI Designer analyzing structured canvas data from a design tool (like Figma/tldraw).

Your task:
1. Analyze SPATIAL LAYOUT to understand visual hierarchy and grouping
2. Detect UI patterns based on shape types, sizes, and positions:
   - Small rectangles with text = Buttons
   - Tall narrow rectangles = Sidebars
   - Horizontal arrays of similar shapes = Navigation/Tabs
   - Stacked rectangles = Form fields
   - Circles/ellipses = Icons, avatars, or decorative elements
3. Infer component relationships based on proximity (shapes near each other are likely in the same container)
4. Extract a color scheme from the colors used (infer good modern colors if only black/white)
5. Suggest appropriate fonts based on the context

Key principles:
- Y-position clustering indicates horizontal sections
- X-position clustering indicates vertical stacks
- Similar sizes = likely related components
- Text content indicates component purpose
- Nested parentId relationships = component hierarchy

IMPORTANT: For fields like 'action', 'label', 'props', and 'layout', you MUST provide a value. Use descriptive defaults:
- action: Use "none" if no interaction, or describe the action like "submit", "navigate", "toggle"
- label: Use empty string "" if no text content
- props: Provide a JSON string like "{}" for no properties, or '{"color": "blue", "size": "large"}' for properties
- layout: Use descriptive position like "top-left", "center", "flex-row", etc.

Viewport: ${viewport.width}x${viewport.height}px`,
        },
        {
          role: "user",
          content: `User's design intent: ${description}

Canvas contains ${shapes.length} shapes:

${JSON.stringify(shapes, null, 2)}

Please analyze this structured data and extract:
1. A modern, professional Style Guide (infer beautiful colors if sketch is monochrome)
2. High-level UI Structure grouped by logical sections
3. Detailed component list with inferred types and purposes
4. Executive summary of the design`,
        },
      ],
    });

    // Apply post-processing defaults if needed (business logic layer)
    object.components.forEach(component => {
      if (!component.label) component.label = "";
      if (!component.props) component.props = "{}";
      if (!component.layout) component.layout = "default";
      
      // Parse props string to object for easier use
      try {
        component.props = JSON.parse(component.props);
      } catch {
        component.props = "{}";
      }
    });

    object.uiStructure.forEach(section => {
      section.elements.forEach(element => {
        if (!element.action) element.action = "none";
      });
    });

    console.log("AI analysis complete!");
    return object;
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to generate analysis");
  }
}