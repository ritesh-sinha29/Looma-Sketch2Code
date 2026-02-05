import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isAdminLoginRoute = createRouteMatcher(["/admin/login"]);
const isProtectedRoutes = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  console.log("SESSIONCLAIMS-------------->", sessionClaims);
  console.log("ROLE FROM PROXY-------------->", sessionClaims?.metadata?.role);

  // 1. If trying to access admin login page, allow it
  if (isAdminLoginRoute(req)) {
    return NextResponse.next();
  }

  // 2. Protect Admin Routes
  if (isAdminRoute(req)) {
    if (!userId) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    const role = sessionClaims?.metadata?.role;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // 3. Protect Dashboard Routes (existing logic)
  if (!userId && isProtectedRoutes(req)) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
