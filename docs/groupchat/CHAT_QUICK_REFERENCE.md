# Real-time Chat - Quick Reference

## 🚀 Quick Start

### Access Chat

```
/dashboard/projects/[projectId]/group-chat
```

Or click **"Group Chat"** button on project page.

---

## 📝 Message Actions

| Action         | Shortcut        | Description          |
| -------------- | --------------- | -------------------- |
| Send message   | `Enter`         | Send current message |
| New line       | `Shift + Enter` | Add line break       |
| Add reaction   | Hover + 😊      | Click emoji picker   |
| Edit message   | -               | Author only (future) |
| Delete message | Hover + ⋯       | Author or owner      |

---

## 😊 Custom Emoji

```
🎯 pixel-perfect    🥷 code-ninja      ✨ design-magic
🚢 ship-it          🤯 mind-blown      ☕ coffee-code
🐛 bug-squash       💡 aha-moment      🦜 party-parrot
🦆 rubber-duck      🔀 git-merge       🚀 deploy-rocket
```

---

## 🔧 Server Functions

### Messages

```typescript
// Get messages with user data & reactions
api.messages.getMessages({ projectId, limit?: 50 })

// Send new message (rate limited: 10/min)
api.messages.sendMessage({ projectId, text })

// Edit message (author only)
api.messages.editMessage({ messageId, text })

// Delete message (author or owner)
api.messages.deleteMessage({ messageId })
```

### Reactions

```typescript
// Get reactions for a message
api.reactions.getReactionsByMessage({ messageId });

// Toggle reaction (add/remove)
api.reactions.toggleReaction({ messageId, emoji });
```

### Presence

```typescript
// Get online users (active within 60s)
api.presence.getOnlineUsers({ projectId });

// Get typing users (active within 3s)
api.presence.getTypingUsers({ projectId });

// Update presence (heartbeat - call every 30s)
api.presence.updatePresence({ projectId });

// Set typing status
api.presence.setTyping({ projectId, isTyping });
```

---

## 🎨 Components

```typescript
// Main chat page
<MessageList projectId={id} />
<TypingIndicator projectId={id} />
<MessageComposer projectId={id} />
<OnlineUsersList projectId={id} />

// Individual components
<MessageItem message={message} />
<EmojiPicker onEmojiSelect={handleSelect} />
```

---

## ⚙️ Configuration

### Rate Limits

- **Messages**: 10 per minute per user
- **Heartbeat**: Every 30 seconds
- **Typing debounce**: 300ms

### Timeouts

- **Online threshold**: 60 seconds
- **Typing expiration**: 3 seconds
- **Cleanup schedule**: Every 5 minutes

### Limits

- **Message length**: 5,000 characters
- **Messages per query**: 50 (default)

---

## 🔒 Security

✅ Server-side validation  
✅ Project membership required  
✅ Author-only editing  
✅ Rate limiting enforced  
✅ XSS prevention  
✅ Emoji whitelist validation

---

## 📊 Database Tables

```typescript
messages {
  projectId, userId, text, timestamp,
  isEdited?, editedAt?
}

reactions {
  messageId, userId, emoji, timestamp
}

presence {
  userId, projectId, isOnline,
  isTyping, lastActive
}
```

---

## 🐛 Common Issues

**Messages not appearing?**
→ Check project membership

**Presence not updating?**
→ Verify heartbeat is running

**Typing indicators missing?**
→ Auto-expire after 3 seconds

---

**Full Documentation**: [CHAT_FEATURE.md](./CHAT_FEATURE.md)
