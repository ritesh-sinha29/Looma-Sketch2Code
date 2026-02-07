# Role-Based Access Control (RBAC) Implementation Guide

This document outlines the RBAC system implemented using **Convex** and **Clerk**.

## 1. Convex Schema Update
We have added a `usersType` field to the `users` table in `convex/schema.ts`. This field stores the user's role: `"user"` or `"admin"`.

```typescript
// convex/schema.ts
users: defineTable({
  // ... other fields
  usersType: v.union(v.literal("user"), v.literal("admin")),
})
```

## 2. Server-Side Security (Convex)
We have implemented security checks in `convex/users.ts`.

### `checkAdmin` Helper
Use this function inside any mutation or query that requires admin privileges. It will throw an error if the user is not an admin.

```typescript
import { checkAdmin } from "./users";

export const someAdminAction = mutation({
  args: { ... },
  handler: async (ctx, args) => {
    await checkAdmin(ctx); // Throws if not admin
    // ... admin logic
  },
});
```

### `isAdmin` Query
A lightweight query to check the current user's admin status on the frontend.

## 3. Clerk Configuration (IMPORTANT)
To sync roles between Clerk and Convex, follow these steps:

### A. Add Role to User Metadata
In your Clerk Dashboard, you can set the `publicMetadata` for a user.
- **Key**: `role`
- **Value**: `"admin"` or `"user"` (default)

### B. Update JWT Template (Optional but recommended)
While we now use separate sync mutations, it is best practice to include the role in your **Convex JWT Template**:
1. Go to **Clerk Dashboard** > **JWT Templates**.
2. Edit the **Convex** template.
3. Add the `metadata` claim.

## 4. Sync Logic
We use two different mutations to ensure roles are correct:
- `createNewUser`: Forces `usersType: "user"`. Called in standard user flows.
- `createAdmin`: Forces `usersType: "admin"`. Called only in the **Admin Console** (protected by middleware).

## 5. Route Protection (Middleware / Proxy)
To prevent users from accessing admin pages (e.g., `/admin`), we use `src/proxy.ts` (Next.js middleware equivalent).

```typescript
// src/proxy.ts
export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims } = await auth();
  const role = sessionClaims?.metadata?.role;

  // Protect /admin routes
  if (req.nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
});
```

## 6. Admin Console Application
We have built a dedicated Admin Console at `/admin`.

### A. Admin Login
- Located at `/admin/login`.
- Uses a dedicated Clerk `SignIn` component.
- Redirects users to `/admin` upon success.

### B. Admin Dashboard
- Displays admin session details (Name, Role, Session ID).
- Lists all registered users (fetched via `api.users.getAllUsers`).
- Allows **Deleting Users** (mutation: `api.users.deleteUser`).

### C. Security in Action
1. **Middleware**: Prevents non-admins from even seeing the `/admin` page.
2. **Backend**: `deleteUser` mutation calls `checkAdmin(ctx)` to ensure the **Caller** is an admin.
3. **Safety**: The mutation also prevents an admin from deleting themselves.

## 7. Summary of Security Added
- **Data Integrity**: The `usersType` field is strictly typed in Convex.
- **Server-side Validation**: The `checkAdmin` utility ensures that even if a user bypasses frontend checks, they cannot execute admin-only operations in the database.
- **JWT-based Trust**: Roles are passed via signed JWTs from Clerk, preventing client-side spoofing.
