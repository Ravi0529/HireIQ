import { NextRequest, NextResponse } from "next/server";
export { default } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

export const middleware = async (req: NextRequest) => {
  const token = await getToken({ req });
  const url = req.nextUrl;

  if (token && (url.pathname === "/login" || url.pathname === "/")) {
    return NextResponse.redirect(new URL("/companies", req.url));
  }

  if (token && url.pathname === "/signup") {
    return NextResponse.redirect(new URL("/profile", req.url));
  }

  if (
    !token &&
    (url.pathname === "/profile" ||
      url.pathname === "/companies" ||
      url.pathname.startsWith("/job/") ||
      url.pathname.startsWith("/feedback/") ||
      url.pathname.startsWith("/analysis/"))
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (token) {
    const userRole = token.role as string;

    if (userRole === "applicant" && url.pathname.startsWith("/analysis/")) {
      return NextResponse.redirect(new URL("/companies", req.url));
    }

    if (userRole === "recruiter" && url.pathname.startsWith("/feedback/")) {
      return NextResponse.redirect(new URL("/companies", req.url));
    }

    if (userRole === "applicant" && url.pathname === "/job/create") {
      return NextResponse.redirect(new URL("/companies", req.url));
    }

    if (userRole === "recruiter" && url.pathname.startsWith("/feedback/")) {
      return NextResponse.redirect(new URL("/companies", req.url));
    }
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/",
    "/profile",
    "/companies",
    "/job/:path*",
    "/feedback/:path*",
    "/analysis/:path*",
  ],
};
