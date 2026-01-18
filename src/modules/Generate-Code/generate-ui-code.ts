"use server";

import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

interface GenerateUICodeInput {
  analysisData: {
    styleGuide: any;
    uiStructure: any[];
    components: any[];
    summary: string;
  };
  userDescription: string;
}

export async function generateUICode(input: GenerateUICodeInput) {
  const { analysisData, userDescription } = input;

  try {
    console.log("Generating production-ready code with AI...");

    const prompt = `You are an expert Frontend Developer. Based on the following UI analysis, generate production-ready React/Next.js code.

USER'S DESCRIPTION:
${userDescription}

DESIGN ANALYSIS:
${JSON.stringify(analysisData, null, 2)}

REQUIREMENTS:
1. Generate clean, production-ready React/Next.js component code
2. Use TypeScript for type safety
3. Use Tailwind CSS for styling based on the style guide colors
4. Make it fully responsive (mobile-first)
5. Follow modern React best practices (hooks, functional components)
6. Include proper accessibility (ARIA labels, semantic HTML)
7. Add hover states and smooth transitions
8. Make sure the component is self-contained and can be copy-pasted

IMPORTANT:
- Use the exact colors from the style guide
- Implement all components from the analysis
- Create a single, complete component file
- DO NOT include imports for Next.js Image or Link unless absolutely necessary
- Use standard HTML elements (img, a) instead
- Include inline comments explaining key sections
- Make it beautiful and modern

Generate ONLY the component code. Do not include explanations before or after the code.`;

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: prompt,
    });

    // Extract code from markdown code blocks if present
    let cleanedCode = text.trim();
    
    // Remove markdown code fences if present
    if (cleanedCode.startsWith("```")) {
      cleanedCode = cleanedCode.replace(/^```(?:tsx?|jsx?|typescript|javascript)?\n?/, "");
      cleanedCode = cleanedCode.replace(/\n?```$/, "");
    }

    console.log("UI Code generated successfully!");
    return {
      success: true,
      code: cleanedCode,
    };
  } catch (error) {
    console.error("UI Code Generation Error:", error);
    return {
      success: false,
      error: "Failed to generate UI code",
      code: null,
    };
  }
}
