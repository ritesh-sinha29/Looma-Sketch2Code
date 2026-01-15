# Looma - Collaborative Sketch to Code Platform
## 14-Day MVP Development Plan

**Vision**: A real-time collaborative whiteboard where teams sketch designs together, convert them to live code with AI, preview instantly, and deploy to production with one click.

---

## 🎯 Tech Stack (2026-Ready)

### Core Framework
- **Next.js 16** (App Router, React Server Components, Server Actions)
- **TypeScript 5+** (Strict mode)
- **React 19** (Latest features)
- **Tailwind CSS 4** (Utility-first styling)
- **pnpm** (Fast, efficient package management)

### Backend & Database
- **Convex** (Real-time database, backend functions, auth integration)
  - Handles all data persistence
  - Real-time subscriptions for collaboration
  - Server-side actions for AI processing
  - Built-in auth integration

### Real-Time Collaboration
- **tldraw** (Canvas/whiteboard library)
  - Rich drawing tools (pen, shapes, text, colors)
  - Extensible architecture
  - Great TypeScript support
- **Liveblocks** (Real-time collaboration engine)
  - **Why Liveblocks over Yjs?**
    - Simpler API, built for React
    - Excellent presence/cursor tracking out of the box
    - Seamless Convex integration
    - Better developer experience
    - Handles conflict resolution automatically
  - Perfect for multi-user cursors and real-time updates

### UI Components & Styling
- **shadcn/ui** (Radix UI-based component library)
  - Accessible, customizable components
  - Copy-paste components (no npm install needed)
- **Lucide Icons** (Modern icon set)
- **Framer Motion** (Smooth animations)

### Code Editor & Preview
- **Monaco Editor** (VS Code editor in browser)
- **@stackblitz/webcontainer** (In-browser Node.js runtime)
  - Execute code in browser
  - Live preview without backend

### AI & Processing
- **OpenAI GPT-4 Vision** (Primary - best quality)
  - Sketch → Code conversion
  - Style guide extraction
- **Alternative**: **Anthropic Claude 3.5 Sonnet** (if OpenAI unavailable)
- **Fallback**: **Replicate** (Open-source models via API)

### Authentication
- **Clerk** (Recommended - best free tier)
  - Pre-built UI components
  - Social logins (GitHub, Google)
  - Team management built-in
- **Alternative**: **Convex Auth** (If you want to self-host)

### File Storage
- **UploadThing** (Recommended)
  - Free tier: 1GB storage, 1GB bandwidth/month
  - Great React integration
  - Image optimization built-in
- **Alternative**: **Vercel Blob** (If staying in Vercel ecosystem)

### Export & Deployment
- **GitHub REST API** (`@octokit/rest`)
  - Create repos, push code
- **Vercel API** (`@vercel/sdk`)
  - One-click deployments
- **Supabase** (PostgreSQL database for exported apps)
  - Free tier: 500MB database, 2GB bandwidth

### Monitoring & Analytics
- **Sentry** (Error tracking - free tier: 5K events/month)
- **PostHog** (Product analytics - free tier: 1M events/month)
- **Vercel Analytics** (Simple web vitals)

---

## 📋 Feature Breakdown

### Feature 1: Collaborative White Canvas
**Tech**: tldraw + Liveblocks + Convex

**Implementation**:
- tldraw provides the canvas UI and drawing tools
- Liveblocks syncs canvas state across users
- Convex stores persistent canvas data
- Liveblocks presence API shows cursors and active users

**Key Components**:
- `CanvasEditor` (Client Component with tldraw)
- Liveblocks Room for each canvas
- Presence indicators (cursors, user avatars)

### Feature 2: Convert to Live Code
**Tech**: OpenAI Vision API + Convex Actions

**Flow**:
1. User clicks "Convert to Live" button
2. Modal collects description + preferences
3. Convex action calls OpenAI with:
   - Canvas snapshot (PNG)
   - Canvas JSON structure
   - User description
4. AI generates React/Next.js component code
5. Store code in Convex `codeWorkspaces` table
6. Redirect to `/project/[id]/live`

### Feature 3: Live Preview with WebContainers
**Tech**: Monaco Editor + StackBlitz WebContainers

**Implementation**:
- Monaco editor for code editing
- WebContainer runs a minimal Vite + React template
- Sync code changes → WebContainer filesystem → auto-reload
- Preview shown in iframe

### Feature 4: StyleGuide Tab
**Tech**: UploadThing + OpenAI Vision + Color extraction

**Flow**:
1. User uploads image (brand asset, screenshot)
2. Extract colors using `colorthief` (client-side)
3. AI analyzes image for typography suggestions
4. Store palette + fonts in Convex
5. Allow applying style guide to new conversions

### Feature 5: Export & Deploy
**Tech**: GitHub API + Vercel API + Supabase

**Flow**:
1. User clicks "Export & Deploy"
2. GitHub OAuth → Create repo → Push code
3. Optional: Connect Supabase → Generate schema
4. Vercel API → Create project → Deploy
5. Show deployment URL

---

## 📅 14-Day Execution Plan

### **Phase 1: Foundation & Setup (Days 1-3)**

#### Day 1: Project Setup & Auth
**Tasks**:
- [ ] Initialize Convex project
- [ ] Setup Clerk authentication
- [ ] Configure Convex + Clerk integration
- [ ] Create basic layout (sidebar, header, main content)
- [ ] Setup routing structure (`/dashboard`, `/project/[id]`)

**Deliverable**: User can sign up/login and see dashboard

#### Day 2: Data Models & Basic CRUD
**Tasks**:
- [ ] Define Convex schema:
  - `users` (via Clerk integration)
  - `teams` (id, name, members[])
  - `projects` (id, teamId, name, createdAt)
  - `canvases` (id, projectId, title, tldrawSnapshot)
  - `codeWorkspaces` (id, projectId, files{}, createdAt)
  - `styleGuides` (id, projectId, colors[], fonts[], imageUrl)
  - `exports` (id, projectId, githubRepo, vercelUrl, supabaseUrl)
- [ ] Create Convex mutations for:
  - Create team, project, canvas
  - List projects for user
- [ ] Build project list UI

**Deliverable**: User can create teams/projects, see list

#### Day 3: Canvas Integration (tldraw)
**Tasks**:
- [ ] Install tldraw: `pnpm add tldraw`
- [ ] Create `CanvasEditor` component
- [ ] Integrate tldraw in `/project/[id]` page
- [ ] Save canvas state to Convex (basic, no realtime yet)
- [ ] Load canvas state from Convex

**Deliverable**: Single-user canvas that saves/loads

---

### **Phase 2: Real-Time Collaboration (Days 4-5)**

#### Day 4: Liveblocks Setup & Integration
**Tasks**:
- [ ] Install Liveblocks: `pnpm add @liveblocks/react @liveblocks/client`
- [ ] Setup Liveblocks account (free tier)
- [ ] Configure Liveblocks with Convex
- [ ] Create Liveblocks room per canvas
- [ ] Sync tldraw state via Liveblocks
- [ ] Test with two browser windows

**Deliverable**: Multi-user canvas with real-time sync

#### Day 5: Presence & Cursors
**Tasks**:
- [ ] Implement Liveblocks presence:
  - Track cursor position
  - Track active tool
  - Show user name/avatar
- [ ] Create cursor component (colored, labeled)
- [ ] Add user list sidebar showing active users
- [ ] Polish cursor animations

**Deliverable**: See other users' cursors and actions in real-time

---

### **Phase 3: AI Conversion (Days 6-8)**

#### Day 6: AI Pipeline Setup
**Tasks**:
- [ ] Setup OpenAI API key in Convex secrets
- [ ] Create Convex action `generateUIFromSketch`
- [ ] Design prompt for sketch → code conversion
- [ ] Test with mock data
- [ ] Add "Convert to Live" button to canvas

**Deliverable**: Button triggers AI call (mock response)

#### Day 7: AI Integration & Code Generation
**Tasks**:
- [ ] Capture canvas snapshot (PNG) before conversion
- [ ] Serialize tldraw JSON structure
- [ ] Build comprehensive prompt:
  - Include canvas image
  - Include structure description
  - User's text description
  - Output format: React component with Tailwind
- [ ] Parse AI response into file structure
- [ ] Store generated code in Convex `codeWorkspaces`
- [ ] Create `/project/[id]/live` route

**Deliverable**: AI generates code from sketch, stored in Convex

#### Day 8: Live Preview (WebContainers)
**Tasks**:
- [ ] Install Monaco Editor: `pnpm add @monaco-editor/react`
- [ ] Install WebContainers: `pnpm add @webcontainer/api`
- [ ] Create `LivePreviewWorkspace` component
- [ ] Setup minimal Vite + React template in WebContainer
- [ ] Load generated code into Monaco editor
- [ ] Sync Monaco changes → WebContainer filesystem
- [ ] Display preview in iframe
- [ ] Handle errors and loading states

**Deliverable**: See code + live preview side-by-side

---

### **Phase 4: StyleGuide Feature (Days 9-10)**

#### Day 9: Image Upload & Color Extraction
**Tasks**:
- [ ] Setup UploadThing account and integration
- [ ] Create `StyleGuide` tab component
- [ ] Build image upload UI (drag-drop)
- [ ] Install `colorthief`: `pnpm add colorthief`
- [ ] Extract dominant colors from uploaded image
- [ ] Display color palette with hex codes
- [ ] Save style guide to Convex

**Deliverable**: Upload image, see extracted colors

#### Day 10: Typography AI & Style Application
**Tasks**:
- [ ] Add OpenAI Vision call to analyze image for typography
- [ ] Extract font suggestions (Google Fonts recommendations)
- [ ] Display typography suggestions in UI
- [ ] Allow saving complete style guide (colors + fonts)
- [ ] Add style guide selector in "Convert to Live" flow
- [ ] Update AI prompt to include style guide preferences

**Deliverable**: Complete style guide with colors + fonts, reusable in conversions

---

### **Phase 5: Export & Deploy (Days 11-13)**

#### Day 11: GitHub Integration
**Tasks**:
- [ ] Setup GitHub OAuth app
- [ ] Install `@octokit/rest`: `pnpm add @octokit/rest`
- [ ] Create Convex action for GitHub operations
- [ ] Implement "Export to GitHub" flow:
  - OAuth flow
  - Create repository
  - Generate file tree from code workspace
  - Push initial commit
- [ ] Add UI for repo name, visibility selection
- [ ] Show export status and repo URL

**Deliverable**: Export code to GitHub repository

#### Day 12: Supabase Integration
**Tasks**:
- [ ] Create Supabase connection UI (project URL, anon key)
- [ ] Generate basic schema template (users, posts example)
- [ ] Create `schema.sql` file in exported repo
- [ ] Generate `.env.example` with Supabase variables
- [ ] Add Supabase client setup in generated code
- [ ] Optional: Create example API route using Supabase

**Deliverable**: Supabase connection + schema generation

#### Day 13: Vercel One-Click Deploy
**Tasks**:
- [ ] Install Vercel SDK: `pnpm add @vercel/sdk`
- [ ] Setup Vercel API token in Convex secrets
- [ ] Create Convex action for Vercel deployment:
  - Link GitHub repo to Vercel project
  - Configure build settings
  - Trigger deployment
  - Poll deployment status
- [ ] Add "Deploy to Vercel" button
- [ ] Display deployment URL and status
- [ ] Store deployment info in Convex

**Deliverable**: One-click deploy to Vercel with live URL

---

### **Phase 6: Polish & QA (Day 14)**

#### Day 14: Testing, Bug Fixes & Documentation
**Tasks**:
- [ ] End-to-end testing:
  - Multi-user canvas collaboration
  - Convert to live flow
  - Live preview editing
  - StyleGuide creation
  - Export → GitHub → Vercel flow
- [ ] Fix critical bugs
- [ ] Add loading states and error handling
- [ ] Improve UI/UX polish
- [ ] Write README with setup instructions
- [ ] Add basic onboarding tooltips
- [ ] Setup analytics (PostHog/Vercel Analytics)

**Deliverable**: Polished MVP ready for demo

---

## 🛠️ Required Dependencies

### Core Dependencies
```json
{
  "dependencies": {
    "next": "16.1.1",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "convex": "^1.20.0",
    "@liveblocks/react": "^1.2.0",
    "@liveblocks/client": "^1.2.0",
    "tldraw": "^3.0.0",
    "@monaco-editor/react": "^4.6.0",
    "@webcontainer/api": "^1.1.0",
    "@clerk/nextjs": "^5.0.0",
    "@clerk/convex": "^1.0.0",
    "@uploadthing/react": "^7.0.0",
    "uploadthing": "^7.0.0",
    "@octokit/rest": "^20.0.0",
    "@vercel/sdk": "^1.0.0",
    "colorthief": "^2.4.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.400.0",
    "zod": "^3.23.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/colorthief": "^2.4.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## 🎨 UI/UX Structure

### Layout
```
┌─────────────────────────────────────────┐
│  Header (Logo, User Menu, Notifications)│
├──────┬──────────────────────────────────┤
│      │                                  │
│ Side │        Main Content Area         │
│ bar  │                                  │
│      │                                  │
│ -    │  [Canvas / Live / StyleGuide]    │
│ Teams│                                  │
│ -    │                                  │
│ Proj │                                  │
│ ects │                                  │
│      │                                  │
└──────┴──────────────────────────────────┘
```

### Pages
1. `/dashboard` - Project list
2. `/project/[id]` - Main workspace with tabs:
   - Canvas tab (tldraw)
   - Live tab (Monaco + Preview)
   - StyleGuide tab (Upload + Palette)
   - Export tab (GitHub + Vercel)

---

## 🔐 Environment Variables

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=your-convex-url
CONVEX_DEPLOY_KEY=your-deploy-key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-key
CLERK_SECRET_KEY=your-secret

# Liveblocks
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=your-key
LIVEBLOCKS_SECRET_KEY=your-secret

# OpenAI
OPENAI_API_KEY=your-key

# UploadThing
UPLOADTHING_SECRET=your-secret
UPLOADTHING_APP_ID=your-app-id

# GitHub (for OAuth)
GITHUB_CLIENT_ID=your-id
GITHUB_CLIENT_SECRET=your-secret

# Vercel
VERCEL_TOKEN=your-token
VERCEL_TEAM_ID=your-team-id

# Supabase (optional, user-provided)
```

---

## 📊 Convex Schema Example

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  teams: defineTable({
    name: v.string(),
    members: v.array(v.string()), // Clerk user IDs
    createdAt: v.number(),
  }),
  
  projects: defineTable({
    teamId: v.id("teams"),
    name: v.string(),
    createdAt: v.number(),
  }),
  
  canvases: defineTable({
    projectId: v.id("projects"),
    title: v.string(),
    tldrawSnapshot: v.any(), // tldraw JSON
    updatedAt: v.number(),
  }),
  
  codeWorkspaces: defineTable({
    projectId: v.id("projects"),
    files: v.object({
      // Dynamic file structure
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  
  styleGuides: defineTable({
    projectId: v.id("projects"),
    imageUrl: v.string(),
    colors: v.array(v.object({
      hex: v.string(),
      name: v.optional(v.string()),
    })),
    fonts: v.array(v.object({
      family: v.string(),
      usage: v.string(),
    })),
    createdAt: v.number(),
  }),
  
  exports: defineTable({
    projectId: v.id("projects"),
    githubRepo: v.optional(v.string()),
    vercelUrl: v.optional(v.string()),
    vercelDeploymentId: v.optional(v.string()),
    supabaseUrl: v.optional(v.string()),
    createdAt: v.number(),
  }),
});
```

---

## 🚀 Third-Party Services (Free Tier Limits)

| Service | Free Tier | What It's Used For |
|---------|-----------|-------------------|
| **Convex** | 1M function calls/month | Database + backend |
| **Clerk** | 10K MAU | Authentication |
| **Liveblocks** | 100 concurrent users | Real-time collaboration |
| **UploadThing** | 1GB storage, 1GB bandwidth | Image uploads |
| **OpenAI** | Pay-per-use | AI code generation |
| **GitHub** | Unlimited private repos | Code export |
| **Vercel** | Unlimited projects | Hosting + deployments |
| **Supabase** | 500MB DB, 2GB bandwidth | Database for exported apps |
| **Sentry** | 5K events/month | Error tracking |
| **PostHog** | 1M events/month | Analytics |

---

## 🎯 Success Metrics (MVP)

- ✅ 2+ users can collaborate on canvas simultaneously
- ✅ Cursors and actions visible in real-time
- ✅ AI converts sketch to working React code
- ✅ Live preview updates as code changes
- ✅ Style guide extracts colors + fonts from images
- ✅ Code exports to GitHub successfully
- ✅ One-click deploy to Vercel works
- ✅ Deployed app is accessible via URL

---

## 🔄 Future Enhancements (Post-MVP)

- Collaborative code editing (Monaco + Liveblocks)
- Version history for canvases and code
- Templates library
- More AI models (Claude, Gemini)
- Export to other frameworks (Vue, Svelte)
- Team chat/commenting
- Design system tokens from style guides
- Mobile app support

---

## 📝 Notes

- **Liveblocks vs Yjs**: Liveblocks is recommended because:
  - Simpler API, built for React
  - Better presence/cursor handling out of the box
  - Easier Convex integration
  - Less boilerplate code
  - Better TypeScript support

- **tldraw**: Chosen for its modern architecture, extensibility, and excellent TypeScript support. Alternative: Excalidraw (more mature but less flexible).

- **WebContainers**: Best solution for in-browser code execution. Alternative: CodeSandbox API (paid) or iframe with sandboxed code (less secure).

---

## 🎓 Learning Resources

- [tldraw Docs](https://tldraw.dev)
- [Liveblocks Docs](https://liveblocks.io/docs)
- [Convex Docs](https://docs.convex.dev)
- [WebContainers Guide](https://webcontainers.io)
- [Clerk + Convex Integration](https://clerk.com/docs/integrations/databases/convex)

---

**Good luck with your 14-day build! 🚀**
