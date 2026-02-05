import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    console.log("🎯 Processing URL:", url);

    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 },
      );
    }

    if (!process.env.SCREENSHOTONE_API_KEY) {
      return NextResponse.json(
        { error: "ScreenshotOne API key not configured" },
        { status: 500 },
      );
    }

    console.log(
      "📸 Step 1: Taking high-quality screenshot with ScreenshotOne...",
    );

    const screenshotParams = new URLSearchParams({
      access_key: process.env.SCREENSHOTONE_API_KEY,
      url: url,
      viewport_width: "1920",
      viewport_height: "1080",
      device_scale_factor: "2", 
      format: "png",
      full_page: "true",
      block_ads: "true",
      block_cookie_banners: "true",
      block_trackers: "true",
      cache: "false",
    });

    const screenshotUrl = `https://api.screenshotone.com/take?${screenshotParams.toString()}`;

    const screenshotResponse = await fetch(screenshotUrl);

    if (!screenshotResponse.ok) {
      const errorText = await screenshotResponse.text();
      console.error(
        "❌ ScreenshotOne failed:",
        screenshotResponse.status,
        errorText,
      );
      return NextResponse.json(
        {
          error: `Failed to capture screenshot: ${errorText}`,
        },
        { status: 500 },
      );
    }

    // Get the image as a buffer, then convert to base64
    const imageBuffer = await screenshotResponse.arrayBuffer();
    const base64Screenshot = Buffer.from(imageBuffer).toString("base64");

    console.log("🧠 Step 2: Analyzing with Gemini Vision...");

    const result = streamText({
      model: google("gemini-3-pro-preview"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an EXPERT frontend developer with extreme attention to visual detail.

Your task is to analyze the provided HIGH-RESOLUTION screenshot and recreate the page with **near pixel-perfect accuracy (≈99%)**.

━━━━━━━━━━━━━━━━━━━━
🔍 VISUAL ANALYSIS REQUIRED
━━━━━━━━━━━━━━━━━━━━

1. **Colors (EXACT - no guessing)**
   - Primary & secondary brand colors (hex)
   - Text colors (headings, body, muted)
   - Backgrounds, borders, gradients, shadows

2. **Typography**
   - Font families
   - Heading & body sizes (map precisely to Tailwind)
   - Font weights, line-heights, letter spacing

3. **Layout & Spacing**
   - Container width (e.g. max-w-6xl / 7xl)
   - Grid & flex structure
   - Padding, margins, gaps (exact Tailwind scale)

4. **UI & Effects**
   - Border radius
   - Shadows
   - Hover & transition states
   - Buttons, cards, forms, icons

━━━━━━━━━━━━━━━━━━━━
🛠️ IMPLEMENTATION RULES
━━━━━━━━━━━━━━━━━━━━

- Tailwind CSS ONLY (no custom CSS)  
- Use Flowbite where appropriate  
- Fully responsive (mobile-first)  
- Semantic HTML5  
- Smooth hover transitions  
- Placeholder images via https://placehold.co  
- Output ONLY the code inside the body tag.

**Tech Stack**
- Tailwind CSS v3 (CDN)
- Flowbite v2.3.0
- FontAwesome v6.5.2

## CODE MODE Instructions

### Output Format
- **CRITICAL**: Wrap ALL HTML in markdown code blocks:
\`\`\`html
[Your complete HTML code here]
\`\`\`
- Include ONLY <body> content (no <html>, <head>, or <title>)
- confirmation text after the code block is completed.


Now analyze the screenshot carefully and generate the **most visually accurate HTML possible**.`,
            },
            {
              type: "image",
              image: base64Screenshot,
            },
          ],
        },
      ],
    });

    console.log("✅ Streaming pixel-perfect code generation...");

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("💥 Backend Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Internal server error",
      },
      { status: 500 },
    );
  }
}
