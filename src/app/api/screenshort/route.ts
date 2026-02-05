import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    if (!process.env.SCREENSHOTONE_API_KEY) {
      return NextResponse.json({ error: "Screenshot API not configured" }, { status: 500 });
    }

    console.log("📸 Taking screenshot of:", url);

    // ScreenshotOne API
    const screenshotUrl = `https://api.screenshotone.com/take?access_key=${process.env.SCREENSHOTONE_API_KEY}&url=${encodeURIComponent(url)}&full_page=true&viewport_width=1920&viewport_height=1080&format=png&response_type=base64`;

    const response = await fetch(screenshotUrl);

    if (!response.ok) {
      throw new Error(`Screenshot API failed: ${response.statusText}`);
    }

    const base64Image = await response.text();
    console.log("✅ Screenshot captured, size:", base64Image.length);

    return NextResponse.json({
      success: true,
      screenshot: `data:image/png;base64,${base64Image}`,
    });
  } catch (error: any) {
    console.error("Screenshot error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}