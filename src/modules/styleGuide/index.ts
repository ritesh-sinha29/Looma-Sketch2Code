"use server";

import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
//import { google } from '@ai-sdk/google';
import { z } from 'zod';

// Schema for exactly what you need
 const styleGuideSchema = z.object({
  primary: z.object({
    name: z.string(), // e.g., "Royal Blue"
    hex: z.string(), // e.g., "#4169E1"
  }),
  secondary: z.object({
    name: z.string(),
    hex: z.string(),
  }),
  accent: z.object({
    name: z.string(),
    hex: z.string(),
  }),
  others: z.array(z.object({
    name: z.string(),
    hex: z.string(),
  })),
  fonts: z.array(z.object({
    name: z.string(), // e.g., "Inter", "Roboto"
    family: z.string(), // e.g., "sans-serif", "serif", "monospace"
  })),
});

 type StyleGuideData = z.infer<typeof styleGuideSchema>;

export const generateStyleGuide = async (images: string[]): Promise<StyleGuideData> => {
  if (!images || images.length === 0) {
    throw new Error('No images provided');
  }
  console.log("Images processed ---------------");
  const result = await generateObject({
   model: openai('gpt-4o-mini'),
    //model: google('gemini-2.5-flash'),
    schema: styleGuideSchema,
    messages: [
      {
        role: 'user',
        content: [
          {
             type: 'text', 
             text: 'Analyze these images and extract a complete style guide including specific color palettes (Primary, Secondary, Accent, Others) and typography suggestions. Ensure hex codes are valid and font names are standard web fonts or Google Fonts.', 
          },
          ...images.map((image) => ({
            type: 'image' as const,
            image: image, // base64 string
          })),
        ],
      },
    ],
  });
  console.log("Result processed ---------------");
  console.log("Result: raw object--------------", result.object);
  return result.object;
};