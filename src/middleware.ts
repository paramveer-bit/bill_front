import { NextRequest, NextResponse } from "next/server";

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/signup", "/"];

// Routes that require the user to NOT be logged in (redirect to dashboard if logged in)
const AUTH_ROUTES = ["/login", "/signup"];

// Routes that require email verification
const VERIFIED_ROUTES: string[] = [
    // add paths like "/dashboard", "/bills" etc
];

// Routes that require profile completion
const COMPLETED_ROUTES: string[] = [
    // add paths like "/dashboard", "/bills" etc
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Read the refresh token cookie to determine logged-in state.
    // The access token lives in memory (client side), so the middleware
    // can only use the refresh token cookie as a signal.
    const refreshToken = request.cookies.get("refreshToken")?.value;
    const isLoggedIn = Boolean(refreshToken);

    // Also read user info cookie if you choose to set a non-httpOnly cookie
    // with basic user info for middleware use. See note below.
    const userInfoCookie = request.cookies.get("userInfo")?.value;
    // console.log("Middleware - isLoggedIn:", isLoggedIn, "Path:", pathname);
    // console.log("Middleware - userInfoCookie:", userInfoCookie);
    // console.log(refreshToken)
    let userInfo: { isVerified?: boolean; isCompleted?: boolean } | null = null;
    if (userInfoCookie) {
        try {
            userInfo = JSON.parse(decodeURIComponent(userInfoCookie));
        } catch {
            userInfo = null;
        }
    }

    // 1. Logged-in users visiting auth pages → redirect to dashboard
    if (isLoggedIn && AUTH_ROUTES.includes(pathname)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 2. Non-logged-in users visiting protected pages → redirect to login
    if (!isLoggedIn && !PUBLIC_ROUTES.includes(pathname)) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 3. Logged-in but unverified users visiting verified-only routes
    if (
        isLoggedIn &&
        userInfo &&
        !userInfo.isVerified &&
        VERIFIED_ROUTES.some((r) => pathname.startsWith(r))
    ) {
        return NextResponse.redirect(new URL("/verify-email", request.url));
    }

    // 4. Logged-in but profile-incomplete users visiting completion-required routes
    if (
        isLoggedIn &&
        userInfo &&
        !userInfo.isCompleted &&
        COMPLETED_ROUTES.some((r) => pathname.startsWith(r))
    ) {
        return NextResponse.redirect(new URL("/complete-profile", request.url));
    }

    return NextResponse.next();
}

export const config = {
    // Run middleware on all routes except Next.js internals and static files
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};