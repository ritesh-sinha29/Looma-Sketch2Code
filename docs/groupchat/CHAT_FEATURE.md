# Real-time Team Chat Feature Documentation

## Overview

The Looma platform includes a production-ready real-time team chat feature that enables project members to communicate instantly within their project workspace. Built with Next.js 16 and Convex, the chat system uses a **server-side first architecture** for maximum security, performance, and type safety.

---

## Key Features

### 🚀 Real-time Messaging

- **Sub-100ms message delivery** via Convex real-time subscriptions
- **Project-specific channels** - Each project has its own isolated chat
- **Message persistence** - All messages stored in Convex database
- **Message editing and deletion** with proper authorization
- **Rate limiting** - 10 messages per minute per user (server-enforced)

### 😊 Custom Emoji Reactions

- **12 unique design/dev-themed emoji** for reactions
- **Toggle-based reactions** - Click to add/remove
- **Real-time reaction updates** across all connected clients
- **Server-side validation** - Only approved emoji allowed

### 👥 Live Presence Indicators

- **Online/offline status** with green/gray dots
- **"Last seen" timestamps** for offline users
- **Automatic presence tracking** via 30-second heartbeat
- **Auto-cleanup** - Stale presence removed every 5 minutes

### ⌨️ Typing Indicators

- **Real-time typing status** - "User is typing..."
- **Shows up to 3 users** typing simultaneously
- **Auto-expiration** - Typing indicators expire after 3 seconds
- **Debounced updates** - 300ms delay to reduce server load

### ✨ Framer Motion Animations

- **Message entry animations** - Smooth fade-in with stagger effect (50ms delay between messages)
- **Bouncing typing dots** - Animated dots with spring physics
- **Reaction animations** - Spring-based pop-in effects for emoji reactions
- **Presence badge animations** - Green online dots animate with spring physics
- **Hover/tap effects** - Interactive micro-animations on reactions (1.2x scale on hover)
- **Sidebar transitions** - Smooth expand/collapse animations (300ms duration)
- **Accessibility support** - Respects `prefers-reduced-motion` for users who prefer minimal animations

---

## Architecture

### Server-Side First Design

All business logic, validation, and data processing occurs on the Convex backend:

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  (Thin presentation layer - UI state only)              │
│                                                          │
│  • MessageList      • MessageComposer                   │
│  • MessageItem      • EmojiPicker                       │
│  • TypingIndicator  • OnlineUsersList                   │
└─────────────────────────────────────────────────────────┘
                          ↓ ↑
              Convex Real-time Subscriptions
                          ↓ ↑
┌─────────────────────────────────────────────────────────┐
│                   SERVER LAYER (Convex)                  │
│                                                          │
│  ✅ Authentication & Authorization                       │
│  ✅ Input Validation & Sanitization                      │
│  ✅ Rate Limiting                                        │
│  ✅ Data Enrichment (user joins, reaction counts)       │
│  ✅ Business Logic (toggle reactions, presence calc)    │
│  ✅ Scheduled Cleanup (stale presence removal)          │
│  ✅ Server-generated Timestamps                         │
└─────────────────────────────────────────────────────────┘
                          ↓ ↑
┌─────────────────────────────────────────────────────────┐
│                   DATABASE (Convex)                      │
│                                                          │
│  • messages         • reactions         • presence      │
└─────────────────────────────────────────────────────────┘
```

---

## Database Schema

### `messages` Table

```typescript
{
  projectId: Id<"projects">,
  userId: Id<"users">,
  text: string,
  timestamp: number,
  isEdited?: boolean,
  editedAt?: number
}
```

**Indexes**: `by_project`, `by_project_timestamp`, `by_user`

### `reactions` Table

```typescript
{
  messageId: Id<"messages">,
  userId: Id<"users">,
  emoji: string,
  timestamp: number
}
```

**Indexes**: `by_message`, `by_user_and_message`

### `presence` Table

```typescript
{
  userId: Id<"users">,
  projectId: Id<"projects">,
  isOnline: boolean,
  isTyping: boolean,
  lastActive: number
}
```

**Indexes**: `by_project`, `by_user_and_project`, `by_last_active`

---

## API Reference

### Convex Functions

#### Messages (`convex/messages.ts`)

**`getMessages(projectId, limit?)`**

- Returns enriched messages with user data and reaction counts
- Default limit: 50 messages
- Requires project membership

**`sendMessage(projectId, text)`**

- Validates text (max 5000 chars)
- Rate limits to 10 messages/minute
- Returns enriched message

**`editMessage(messageId, text)`**

- Author-only authorization
- Marks message as edited with timestamp

**`deleteMessage(messageId)`**

- Author or project owner authorization
- Cascade deletes all reactions
- No confirmation required (instant deletion)

#### Reactions (`convex/reactions.ts`)

**`getReactionsByMessage(messageId)`**

- Returns reactions grouped by emoji
- Includes user details for each reaction

**`toggleReaction(messageId, emoji)`**

- Validates emoji against approved list
- Smart toggle: adds if not present, removes if present

#### Presence (`convex/presence.ts`)

**`getOnlineUsers(projectId)`**

- Calculates online status (active within 60s)
- Returns sorted list (online first)

**`getTypingUsers(projectId)`**

- Returns users typing (active within 3s)

**`updatePresence(projectId)`**

- Heartbeat function (call every 30s)

**`setTyping(projectId, isTyping)`**

- Updates typing status

**`cleanupStalePresence()`** (Scheduled)

- Removes presence records older than 10 minutes
- Runs every 5 minutes

---

## Custom Emoji

| Emoji | ID              | Unicode           | Use Case |
| ----- | --------------- | ----------------- | -------- |
| 🎯    | `pixel-perfect` | Perfect alignment |
| 🥷    | `code-ninja`    | Great coding      |
| ✨    | `design-magic`  | Beautiful design  |
| 🚢    | `ship-it`       | Ready to deploy   |
| 🤯    | `mind-blown`    | Amazing idea      |
| ☕    | `coffee-code`   | Coding session    |
| 🐛    | `bug-squash`    | Bug fixed         |
| 💡    | `aha-moment`    | Breakthrough      |
| 🦜    | `party-parrot`  | Celebration       |
| 🦆    | `rubber-duck`   | Debugging         |
| 🔀    | `git-merge`     | Successful merge  |
| 🚀    | `deploy-rocket` | Deployment        |

---

## Usage Guide

### Accessing the Chat

1. Navigate to any project: `/dashboard/projects/[projectId]`
2. Click the **"Group Chat"** button
3. Or navigate directly to: `/dashboard/projects/[projectId]/group-chat`

### Sending Messages

- Type in the message composer at the bottom
- Press **Enter** to send (or click the send button)
- Press **Shift+Enter** for a new line
- Character limit: 5,000 characters

### Adding Reactions

1. Hover over any message
2. Click the emoji picker button (smile icon)
3. Select an emoji from the grid
4. Click again to remove your reaction
5. Reactions display as actual emoji symbols (✨, 🚀, etc.) not text names

### Presence & Typing

- Your online status updates automatically every 30 seconds
- Typing indicators appear when you type (300ms debounce)
- Other users see "User is typing..." in real-time

---

## Security Features

### Server-Side Validation

- ✅ All text sanitized and validated
- ✅ Maximum message length enforced (5,000 chars)
- ✅ Emoji reactions validated against approved list
- ✅ XSS prevention through input sanitization

### Authorization

- ✅ Project membership verified for all operations
- ✅ Message editing restricted to author
- ✅ Message deletion restricted to author or project owner
- ✅ Authentication required for all mutations

### Rate Limiting

- ✅ 10 messages per minute per user
- ✅ Server-side enforcement
- ✅ Prevents spam and abuse

---

## Performance Metrics

| Metric             | Value           |
| ------------------ | --------------- |
| Message Delivery   | < 100ms         |
| Presence Heartbeat | 30 seconds      |
| Typing Debounce    | 300ms           |
| Typing Auto-expire | 3 seconds       |
| Online Threshold   | 60 seconds      |
| Cleanup Schedule   | Every 5 minutes |

---

## File Structure

```
/convex
  schema.ts              # Database schema
  messages.ts            # Message queries/mutations
  reactions.ts           # Reaction queries/mutations
  presence.ts            # Presence tracking
  emojiConstants.ts      # Server-side emoji validation
  crons.ts               # Scheduled cleanup jobs

/src/components/chat
  MessageList.tsx        # Message list with auto-scroll
  MessageItem.tsx        # Individual message display
  MessageComposer.tsx    # Message input
  EmojiPicker.tsx        # Custom emoji picker
  TypingIndicator.tsx    # Typing status display
  OnlineUsersList.tsx    # Online users sidebar

/src/lib
  emoji-config.ts        # Client-side emoji config
  animations.ts          # Framer Motion animation variants

/src/app/(main)/dashboard/projects/[id]/group-chat
  page.tsx               # Main chat interface
```

---

## Future Enhancements

### Potential Features

- [ ] Message search with full-text indexing
- [ ] File/image sharing
- [ ] Thread replies to messages
- [ ] User @mentions with notifications
- [ ] Read receipts
- [ ] Message pinning
- [ ] Code snippet formatting
- [ ] Keyboard shortcuts (Cmd+K for search)
- [ ] Voice/video calls integration
- [ ] Message reactions analytics

### Performance Optimizations

- [ ] Virtual scrolling for large message lists
- [ ] Lazy loading of older messages
- [ ] Message caching strategy
- [ ] Optimistic UI updates for reactions

---

## Troubleshooting

### Messages Not Appearing

- Check that you're a member of the project
- Verify Convex dev server is running
- Check browser console for errors

### Presence Not Updating

- Ensure the heartbeat interval is running (check console)
- Verify you're authenticated
- Check network connectivity

### Typing Indicators Not Showing

- Typing indicators auto-expire after 3 seconds
- Check that other users are actually typing
- Verify presence system is working

---

## Technical Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Convex (serverless functions + real-time database)
- **Authentication**: Clerk
- **Styling**: Tailwind CSS, shadcn/ui
- **Animations**: Framer Motion 12.26.2
- **Real-time**: Convex reactive queries
- **Type Safety**: End-to-end TypeScript with Convex generated types

---

## Support & Maintenance

### Monitoring

- Monitor Convex dashboard for function performance
- Check scheduled job execution logs
- Review rate limiting metrics

### Database Maintenance

- Automatic cleanup via scheduled functions
- No manual intervention required
- Indexes optimized for query performance

---

**Last Updated**: February 7, 2026  
**Version**: 1.1.0  
**Status**: Production Ready ✅

**Recent Updates (v1.1.0)**:

- ✨ Added Framer Motion animations throughout the chat interface
- 🎨 Improved emoji reactions to display actual symbols instead of text names
- ⚡ Removed confirmation dialog for instant message deletion
- 🎭 Added smooth sidebar expand/collapse animations
- ♿ Full accessibility support with reduced motion preferences
