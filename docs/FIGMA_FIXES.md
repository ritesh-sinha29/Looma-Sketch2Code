# Figma OAuth Integration - Key Fixes

## ✅ Fixed Issues

### 1. **Token Exchange Endpoint** (CRITICAL FIX)
**Problem:** Was using incorrect URL `https://www.figma.com/api/oauth/token`  
**Solution:** Changed to correct URL `https://api.figma.com/v1/oauth/token`

This was causing the "Not Found" error during OAuth callback.

### 2. **OAuth Scope**
**Updated:** Changed from deprecated `file_read` to `file_content:read`  
**Reason:** `file_content:read` is the current recommended scope for reading Figma file contents

## 📝 Correct Figma API Endpoints

### OAuth Endpoints
- **Authorization URL:** `https://www.figma.com/oauth`
- **Token Exchange:** `https://api.figma.com/v1/oauth/token` ✅
- **Token Refresh:** `https://api.figma.com/v1/oauth/refresh`

### File API Endpoints
- **Get File:** `https://api.figma.com/v1/files/:key`
- **Get Images:** `https://api.figma.com/v1/images/:key`
- **Get File Versions:** `https://api.figma.com/v1/files/:key/versions`

## 🔐 OAuth Scopes Reference

### Current Scopes (Recommended)
- `file_content:read` - Read file contents, nodes, editor type ✅
- `file_comments:read` - Read comments on files
- `file_comments:write` - Post and delete comments
- `webhooks:write` - Create and manage webhooks

### Deprecated Scopes (Avoid)
- ~~`files:read`~~ - Use `file_content:read` instead
- ~~`file_read`~~ - Not a valid scope

## 🧪 Testing After Fix

1. **Clear cookies** (important!)
   - Open DevTools → Application → Cookies
   - Delete `figma_access_token` if it exists

2. **Test OAuth flow:**
   ```
   Click "Connect Figma" → Authorize → Should redirect successfully
   ```

3. **Expected logs:**
   ```
   📍 Figma OAuth callback hit
   ✅ Received OAuth code: LplGLsgnOX...
   🔄 Exchanging code for access token...
   ✅ Access token received: figd_ABC123...
   ✅ Redirecting back to app with token
   ```

4. **Test file import:**
   - Click "Import from Figma"
   - Paste file URL
   - Should successfully fetch file data

## 🔍 Debugging Tips

### Check Token Exchange Response
If still getting errors, check the response:

```typescript
// In callback/route.ts, add before line 49:
console.log('Response status:', tokenResponse.status);
console.log('Response headers:', Object.fromEntries(tokenResponse.headers));
```

### Verify Environment Variables
```bash
# Check these are set correctly:
NEXT_PUBLIC_BASE_URL=http://localhost:3000
FIGMA_CLIENT_ID=77sqBvCOCwKHa6JC3X9YW5
FIGMA_CLIENT_SECRET=ocpbUOXHXUeY7GXiwGusOhObupJm2K
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Not Found" | Wrong token endpoint | Use `api.figma.com/v1/oauth/token` |
| "Invalid client" | Wrong client ID/secret | Check env variables |
| "Invalid redirect_uri" | Mismatch with Figma app settings | Must match exactly |
| "Code expired" | Code used after 30s | Retry OAuth flow |
| "Invalid scope" | Using deprecated scope | Use `file_content:read` |

## 📚 References

- [Figma OAuth Documentation](https://www.figma.com/developers/api#authentication)
- [Figma API Reference](https://www.figma.com/developers/api)
- [OAuth 2.0 Scopes](https://www.figma.com/developers/api#oauth2-scopes)
