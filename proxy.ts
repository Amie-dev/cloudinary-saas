import {
  auth,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/signin", "/signup", "/", "/home"]);

const isPublicApiRoute = createRouteMatcher(["/api/videos"]);

export default clerkMiddleware((auth, req) => {
  const { userId } = auth();
  const currentUrl = new URL(req.url);

  const isAccessingDashboard = currentUrl.pathname === "/home";
  const isApiRequest = currentUrl.pathname.startsWith("/api");

  // Redirect signed-in users away from signin/signup
  if (userId && isPublicRoute(req) && !isAccessingDashboard) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  // Allow public API route
  if (isApiRequest && isPublicApiRoute(req)) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users trying to access protected routes
  //   if (!userId && !isPublicRoute(req) && !isPublicApiRoute(req)) {
  //     return NextResponse.redirect(new URL("/signin", req.url));
  //   }


  //not logged in
  if (!userId) {
    // if User is not logIn and try in to access a procteced route
    if (!isPublicApiRoute(req) && !isPublicRoute(req)) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }
// if the request is for a procted API and user is not logIn
    if (isApiRequest && !isPublicRoute(req)) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
