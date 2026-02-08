# 🎨 Looma - Collaborative Design to Code Platform

> Transform your design sketches into production-ready React code with AI-powered generation and real-time team collaboration.

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2016-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Powered by Convex](https://img.shields.io/badge/Powered%20by-Convex-orange?style=for-the-badge)](https://convex.dev/)
[![Real-time with Liveblocks](https://img.shields.io/badge/Real--time-Liveblocks-blue?style=for-the-badge)](https://liveblocks.io/)

## ✨ What is Looma?

Looma is a comprehensive platform that bridges the gap between design and development. It combines real-time collaborative whiteboarding, AI-powered code generation, task management, and team chat into a single, unified workspace.

### Key Features

🎨 **Real-Time Collaborative Canvas**

- Multi-user whiteboard powered by tldraw
- Live cursor tracking and presence indicators
- Conflict-free synchronization with Yjs CRDT
- Professional drawing tools and shapes

🤖 **AI Code Generation**

- Convert design sketches to React components
- Intelligent code analysis and suggestions
- Style-aware component generation
- WebContainer-based live preview

📋 **Task Management**

- Kanban-style task boards
- Priority levels and deadline tracking
- Assignee management
- Drag-and-drop task organization

💬 **Group Chat with AI Assistant**

- Real-time project discussions
- AI-powered chat assistance
- Message reactions and editing
- Typing indicators and presence

🎨 **Style Guide System**

- Extract colors and fonts from brand assets
- Apply consistent design tokens
- Share style guides across projects

🔄 **Component Versioning**

- Track component changes over time
- Approve/reject change requests
- View diffs between versions
- Collaborative code review workflow

👥 **Team Collaboration**

- Invite team members via shareable links
- Role-based permissions (Owner/Member)
- Real-time presence and cursors
- Project member management

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm**
- **Convex** account ([convex.dev](https://convex.dev))
- **Clerk** account ([clerk.com](https://clerk.com))
- **Liveblocks** account ([liveblocks.io](https://liveblocks.io))
- **tldraw** license key (optional for production)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/looma-sketch2code.git
   cd looma-sketch2code
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Convex (Database & Backend)
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
   CONVEX_DEPLOY_KEY=your-deploy-key

   # Clerk (Authentication)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   CLERK_JWT_ISSUER_DOMAIN=your-domain.clerk.accounts.dev

   # Liveblocks (Real-time Collaboration)
   NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_prod_...
   LIVEBLOCKS_SECRET_KEY=sk_prod_...

   # tldraw (Canvas)
   NEXT_PUBLIC_TLDRAW_LICENSE_KEY=your-license-key

   # AI Integration (optional)
   OPENAI_API_KEY=sk-...
   GOOGLE_GENERATIVE_AI_API_KEY=...
   ```

4. **Initialize Convex**

   ```bash
   pnpm dlx convex dev
   ```

5. **Start development server**

   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
looma/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication routes
│   │   ├── (main)/            # Protected dashboard routes
│   │   │   ├── dashboard/    # Dashboard pages
│   │   │   ├── projects/     # Project management
│   │   │   ├── tasks/        # Task management
│   │   │   └── chat/         # Group chat
│   │   ├── api/              # API routes
│   │   ├── invite/           # Invite link handling
│   │   └── onboard/          # User onboarding
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── task_manager/    # Task-related components
│   │   ├── group_chat/      # Chat components
│   │   └── ai-elements/     # AI-powered components
│   ├── modules/             # Feature modules
│   │   ├── dashboard/       # Dashboard components
│   │   ├── projects/        # Project components
│   │   ├── generate/        # Code generation
│   │   └── styleGuide/      # Style guide tools
│   ├── hooks/               # Custom React hooks
│   └── lib/                 # Utilities & providers
├── convex/                  # Backend functions & schema
│   ├── schema.ts           # Database schema
│   ├── users.ts            # User management
│   ├── projects.ts         # Project operations
│   ├── task_manager/       # Task CRUD
│   ├── group_chat/         # Chat & AI
│   └── generatedCode.ts    # Code generation
├── docs/                    # Documentation
└── public/                  # Static assets
```

## 🎯 Core Features Documentation

### 1. Real-Time Canvas Collaboration

The canvas system uses a sophisticated stack:

- **tldraw**: Professional whiteboard library
- **Yjs**: CRDT for conflict-free synchronization
- **Liveblocks**: Managed WebSocket infrastructure

**How it works:**

1. Canvas state stored in Yjs document
2. Changes broadcast via Liveblocks WebSocket
3. CRDT ensures all users stay in sync
4. Live cursors show collaborator positions

**Implementation:** `src/app/(main)/dashboard/projects/[id]/canvas/`

### 2. Task Management System

Kanban-style task board with drag-and-drop functionality:

- **4 Status Columns**: Todo, In Progress, Review, Done
- **Priority Levels**: Critical, High, Medium, Low
- **Assignee Tracking**: Assign tasks to team members
- **Deadline Management**: Set and track due dates

**Database Schema:** See `tasks` table in `convex/schema.ts`

**Implementation:** `src/components/task_manager/`

### 3. Group Chat with AI Assistant

Real-time team communication with intelligent AI:

- **Real-time Messages**: Instant message delivery
- **AI Responses**: Context-aware assistance
- **Message Reactions**: Emoji reactions
- **Typing Indicators**: See who's typing
- **Presence Tracking**: Online/offline status

**Database Schema:** `messages`, `reactions`, `presence`, `ai_config`, `ai_analytics`

**Implementation:** `src/components/group_chat/` and `convex/group_chat/`

### 4. AI Code Generation

Transform sketches into React components:

- **Image Analysis**: AI analyzes design sketches
- **Component Generation**: Creates React code
- **Live Preview**: In-browser code execution
- **Style Application**: Uses style guides

**Implementation:** `src/modules/generate/` and `convex/generatedCode.ts`

### 5. Style Guide System

Maintain design consistency:

- **Color Extraction**: Extract palettes from images
- **Font Detection**: Identify and recommend fonts
- **Token Management**: Reusable design tokens
- **Cross-Project Sharing**: Share guides

**Implementation:** `src/modules/styleGuide/` and `convex/styleGuides.ts`

### 6. Component Versioning

Track and manage component changes:

- **Version History**: Track all component versions
- **Change Requests**: Propose and review changes
- **Diff Visualization**: See what changed
- **Approval Workflow**: Owner approval required

**Database Schema:** `componentVersions`, `changeRequests`

## 🗄️ Database Schema

### Core Tables

| Table               | Purpose               | Key Fields                                          |
| ------------------- | --------------------- | --------------------------------------------------- |
| `users`             | User accounts         | name, email, tokenIdentifier, type (free/pro/elite) |
| `projects`          | Projects & workspaces | name, ownerId, members[], inviteCode                |
| `tasks`             | Task management       | projectId, assigneeId, status, priority, deadline   |
| `messages`          | Chat messages         | projectId, userId, text, isAI                       |
| `reactions`         | Message reactions     | messageId, userId, emoji                            |
| `presence`          | User presence         | userId, projectId, isOnline, isTyping               |
| `styleGuides`       | Design systems        | userId, colors, fonts                               |
| `codespaces`        | Code workspaces       | projectId, code, messageHistory                     |
| `componentVersions` | Component history     | projectId, componentCode, version, isApproved       |
| `changeRequests`    | Change proposals      | componentName, status, linesAdded, linesRemoved     |
| `ai_config`         | AI settings           | projectId, enabled, responseFrequency               |
| `ai_analytics`      | AI metrics            | projectId, totalMessages, aiResponses               |

## 🛠️ Technology Stack

### Frontend

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Animations**: Framer Motion
- **Canvas**: tldraw 4
- **Forms**: React Hook Form + Zod validation

### Backend

- **Database**: Convex (real-time)
- **Authentication**: Clerk
- **Real-time Sync**: Liveblocks + Yjs
- **AI Integration**: OpenAI GPT-4, Google Gemini

### Development Tools

- **Package Manager**: pnpm
- **Code Quality**: Biome (linting & formatting)
- **Type Safety**: TypeScript strict mode

## 📝 Development Commands

```bash
# Development
pnpm dev                 # Start Next.js dev server
pnpm dlx convex dev      # Start Convex backend

# Code Quality
pnpm lint                # Run Biome linter
pnpm format              # Format code with Biome

# Production
pnpm build               # Build for production
pnpm start               # Start production server
```

## 🔐 Authentication Flow

1. User clicks Google/GitHub login
2. Clerk handles OAuth redirect
3. JWT token issued and stored
4. User created/updated in Convex
5. Onboarding flow (first-time users)
6. Redirected to dashboard

**Implementation:** `src/app/(auth)/` and `src/hooks/user-store.tsx`

## 🎨 Onboarding Flow

New users complete a 3-step process:

1. **Theme Selection**: Choose light/dark/system theme
2. **First Project**: Create initial project with tags
3. **Invite Link**: Get shareable invite link

**Implementation:** `src/app/onboard/[userId]/page.tsx`

## 🔗 Invite System

Share projects securely:

- **Unique Codes**: 8-character random invite codes
- **Shareable Links**: One-click join via URL
- **Social Sharing**: WhatsApp, Email, Discord integration
- **Authentication Required**: Must login to join

**Flow:** Invite link → Join page → Auth check → Add to project → Redirect to canvas

## 🚧 Current Status & Roadmap

### ✅ Completed (v1.0)

- Real-time collaborative canvas
- Project & team management
- Authentication & authorization
- Task management system
- Group chat with AI assistant
- Basic code generation
- Style guide system
- Component versioning

### 🚧 In Progress

- Enhanced AI code generation
- WebContainer integration for live preview
- Figma plugin integration
- Advanced diffing visualization

### 📋 Planned Features

- **Phase 2**: Full Figma integration
- **Phase 3**: GitHub export & deployment
- **Phase 4**: Advanced analytics
- **Phase 5**: Mobile apps

## 📚 Documentation

- **[Complete Technical Documentation](./PROJECT_DOCUMENTATION.md)** - Comprehensive 900+ line technical guide
- **[Figma Integration Guide](./docs/FIGMA_INTEGRATION.md)** - Figma plugin documentation
- **[Group Chat Documentation](./docs/groupchat/)** - Chat & AI features
- **[RBAC Guide](./docs/RBAC_GUIDE.md)** - Role-based access control
- **[Real-time Collaboration](./docs/REALTIME_COLLAB.md)** - Collaboration architecture

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use Biome for formatting and linting
- Follow TypeScript strict mode
- Write meaningful commit messages
- Add comments for complex logic

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **tldraw** for the amazing canvas library
- **Convex** for the powerful real-time database
- **Liveblocks** for collaboration infrastructure
- **Clerk** for authentication services
- **Vercel** for hosting and deployment
- **shadcn/ui** for beautiful UI components

## 📞 Support

- **Documentation**: See `docs/` folder
- **Issues**: [GitHub Issues](https://github.com/yourusername/looma-sketch2code/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/looma-sketch2code/discussions)

## 🌟 Star History

If you find this project useful, please consider giving it a star ⭐

---

**Built with ❤️ by the Looma Team**

Last Updated: February 9, 2026
