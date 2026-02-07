# Figma Integration

This guide explains how to use the Figma integration feature to import designs into your Looma projects.

## Setup

### Prerequisites

1. **Figma App Configuration**
   - Create a Figma app at https://www.figma.com/developers/apps
   - Add redirect URI: `http://localhost:3000/api/figma/callback`
   - For production, add: `https://yourdomain.com/api/figma/callback`

2. **Environment Variables**
   Add to your `.env.local`:
   ```env
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   FIGMA_CLIENT_ID=your_client_id
   FIGMA_CLIENT_SECRET=your_client_secret
   ```

## How It Works

### OAuth Flow

1. User clicks "Connect Figma" button
2. Redirected to Figma OAuth page
3. User authorizes the app
4. Redirected back to `/api/figma/callback`
5. Access token stored in HTTP-only cookie
6. User can now import Figma files

### Import Process

1. After connection, click "Import from Figma"
2. Paste Figma file URL (e.g., `https://www.figma.com/file/ABC123/Project-Name`)
3. File is fetched from Figma API
4. Design data and images are returned
5. Data can be processed and saved to database

## API Routes

### `/api/figma/auth-url`
- **Method**: GET
- **Description**: Generates Figma OAuth authorization URL
- **Response**: `{ url: string }`

### `/api/figma/callback`
- **Method**: GET
- **Description**: Handles OAuth callback from Figma
- **Query Params**: `code`, `state`, `error`
- **Response**: Redirects to project page

### `/api/figma/status`
- **Method**: GET
- **Description**: Check if user is connected to Figma
- **Response**: `{ isConnected: boolean }`

### `/api/figma/files`
- **Method**: POST
- **Description**: Fetch Figma file data
- **Body**: `{ fileUrl: string }`
- **Response**: `{ success: boolean, file: object, images: object }`

## Usage

### Using the Hook

```tsx
import { useFigmaImport } from "@/modules/figma/useFigmaImport";

function MyComponent() {
  const { isConnected, isImporting, checkConnection, connect, importFile } = useFigmaImport();

  const handleImport = async () => {
    const result = await importFile("https://www.figma.com/file/...");
    if (result.success) {
      console.log("File data:", result.file);
      console.log("Images:", result.images);
    }
  };

  return (
    <button onClick={isConnected ? handleImport : connect}>
      {isConnected ? "Import" : "Connect Figma"}
    </button>
  );
}
```

### Processing Figma Data

```tsx
import { FigmaProcessor } from "@/modules/figma/processor";

const processedData = FigmaProcessor.processFileData(fileData);
const frames = FigmaProcessor.extractFrames(fileData);
const hexColor = FigmaProcessor.colorToHex({ r: 1, g: 0.5, b: 0 });
```

## File Structure

```
src/
├── app/
│   └── api/
│       └── figma/
│           ├── auth-url/route.ts      # Generate OAuth URL
│           ├── callback/route.ts      # OAuth callback handler
│           ├── status/route.ts        # Connection status
│           └── files/route.ts         # Fetch file data
├── modules/
│   └── figma/
│       ├── types.ts                   # TypeScript types
│       ├── processor.ts               # Data processing utilities
│       └── useFigmaImport.ts         # React hook
└── convex/
    └── figma.ts                       # Database mutations
```

## Security

- Access tokens are stored in HTTP-only cookies
- Tokens expire after 2 hours by default
- Always validate user permissions before importing
- Never expose `FIGMA_CLIENT_SECRET` to the client

## Troubleshooting

### "Not authenticated" error
- Check if Figma connection has expired
- Reconnect by clicking "Connect Figma"

### "Invalid Figma URL" error
- Ensure URL format is correct: `https://www.figma.com/file/{fileKey}/{fileName}`
- File must be accessible with your Figma account

### "Failed to fetch file" error
- Check if you have access to the file in Figma
- Verify the file hasn't been deleted
- Ensure access token hasn't expired

## Next Steps

- [ ] Add file preview before import
- [ ] Store imported files in database
- [ ] Convert Figma frames to Tldraw shapes
- [ ] Support for Figma components and styles
- [ ] Batch import multiple files
- [ ] Real-time sync with Figma

--------------------------------------
I've successfully implemented a complete Figma OAuth integration for your Looma platform! Here's what I've created:

📁 Files Created/Updated
API Routes (Backend)
✅ 
/api/figma/auth-url/route.ts
 - Generates OAuth URL
✅ 
/api/figma/callback/route.ts
 - Handles OAuth callback (already existed, kept as-is)
✅ 
/api/figma/files/route.ts
 - Fetches Figma files (already existed, kept as-is)
✅ 
/api/figma/status/route.ts
 - Checks connection status
Frontend (UI)
✅ projects/[id]/page.tsx - Updated with Dialog, state management, and import logic
Utility Modules
✅ 
src/modules/figma/processor.ts
 - Data processing utilities
✅ 
src/modules/figma/useFigmaImport.ts
 - Reusable React hook
✅ 
src/modules/figma/FigmaTestPanel.tsx
 - Test/debug component
Database
✅ 
convex/figma.ts
 - Mutations for saving imports
Documentation
✅ 
docs/FIGMA_INTEGRATION.md
 - Complete guide
✅ 
docs/FIGMA_IMPLEMENTATION_SUMMARY.md
 - Implementation details
✅ 
docs/FIGMA_QUICKSTART.md
 - Quick start guide
✅ Flowchart diagram (visual reference)
🔄 How It Works
See the flowchart above for a visual representation!

Authentication Flow:

User clicks "Connect Figma" →
Redirected to Figma OAuth →
User authorizes →
Token stored in secure cookie →
Button changes to "Import from Figma"
Import Flow:

User enters Figma file URL →
API fetches file data →
Data returned and logged to console →
Ready to process/save/display
------------------------------------------
🎯 What You Can Do Next
The data is currently logged to console. You can now:

Save to database using 
convex/figma.ts
 mutations
Display thumbnails and file info in the UI
Convert Figma frames to Tldraw canvas shapes
Extract design tokens (colors, fonts, spacing)
Show import history for each project