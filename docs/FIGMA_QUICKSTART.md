# Figma Integration - Quick Start Guide

## 🚀 Quick Test (5 minutes)

### Step 1: Verify Setup ✓
Your environment variables are already configured in `.env.local`:
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
FIGMA_CLIENT_ID=77sqBvCOCwKHa6JC3X9YW5
FIGMA_CLIENT_SECRET=ocpbUOXHXUeY7GXiwGusOhObupJm2K
```

### Step 2: Start Development Server
```bash
pnpm dev
```

### Step 3: Test the Integration

1. **Navigate to a project**
   - Go to `http://localhost:3000/dashboard/projects/[any-project-id]`

2. **Connect to Figma**
   - Click the "Connect Figma" button
   - You'll be redirected to Figma's authorization page
   - Click "Allow access"
   - You'll be redirected back to your project

3. **Import a Design**
   - After connecting, the button changes to "Import from Figma"
   - Click it to open the import dialog
   - Paste a Figma file URL (format: `https://www.figma.com/file/ABC123/Name`)
   - Click "Import Design"
   - Check the browser console to see the imported data

## 📋 Complete File Structure

```
looma/
├── src/
│   ├── app/
│   │   ├── (main)/
│   │   │   └── dashboard/
│   │   │       └── projects/
│   │   │           └── [id]/
│   │   │               └── page.tsx ✅ (Updated with Dialog & logic)
│   │   └── api/
│   │       └── figma/
│   │           ├── auth-url/
│   │           │   └── route.ts ✅ (Generates OAuth URL)
│   │           ├── callback/
│   │           │   └── route.ts ✅ (Handles OAuth callback)
│   │           ├── files/
│   │           │   └── route.ts ✅ (Fetches Figma files)
│   │           └── status/
│   │               └── route.ts ✅ (Checks connection)
│   └── modules/
│       └── figma/
│           ├── types.ts ✅ (TypeScript interfaces)
│           ├── processor.ts ✅ (Data processing utils)
│           ├── useFigmaImport.ts ✅ (React hook)
│           └── FigmaTestPanel.tsx ✅ (Test component)
├── convex/
│   └── figma.ts ✅ (Database mutations)
├── docs/
│   ├── FIGMA_INTEGRATION.md ✅ (Full documentation)
│   └── FIGMA_IMPLEMENTATION_SUMMARY.md ✅ (Implementation summary)
└── public/
    └── figma.png ✅ (Figma logo already exists)
```

## 🔍 How to Get a Figma File URL

1. Open any Figma file
2. Copy the URL from the browser
3. Format: `https://www.figma.com/file/{FILE_KEY}/{FILE_NAME}`
4. Example: `https://www.figma.com/file/ABC123xyz/My-Design-Project`

## 🎯 What Happens When You Import

1. **File Data Retrieved:**
   - File name, version, last modified date
   - Document structure (pages, frames, components)
   - Design properties (colors, sizes, positions)

2. **Images Fetched:**
   - Thumbnail URL
   - Exportable image URLs for all nodes

3. **Logged to Console:**
   - Check browser DevTools > Console
   - Look for: `"Imported Figma Data:"`

## 🧪 Debugging

### Test Individual Endpoints

**Check Connection Status:**
```bash
curl http://localhost:3000/api/figma/status
```

**Get Auth URL:**
```bash
curl http://localhost:3000/api/figma/auth-url
```

### Common Issues

**"Not authenticated"**
- Cookie might have expired (2 hours)
- Click "Connect Figma" again

**"Invalid Figma URL"**
- Ensure URL format is correct
- URL must start with `https://www.figma.com/file/`

**"Failed to fetch file"**
- Make sure you have access to the file in Figma
- File must not be private (unless you have access)

## 📊 What's Next?

The imported data is currently logged to the console. You can:

1. **Save to Database**
   - Use the `saveFigmaImport` mutation in `convex/figma.ts`
   - Uncomment the database save logic

2. **Display in UI**
   - Show file name, thumbnail, pages
   - Create a gallery of imported designs

3. **Convert to Canvas**
   - Map Figma frames to Tldraw shapes
   - Import to the canvas editor

4. **Extract Design Tokens**
   - Colors, fonts, spacing
   - Use `FigmaProcessor` utilities

## 💡 Tips

- Keep DevTools console open to see logs
- Check Network tab for API calls
- Access token is stored as a cookie (check Application tab)
- Token expires after 2 hours by default

## 📚 Documentation

- **Full Guide:** `docs/FIGMA_INTEGRATION.md`
- **Implementation Details:** `docs/FIGMA_IMPLEMENTATION_SUMMARY.md`

---

Ready to test? Just click that "Connect Figma" button! 🎨
