// app/middleware.ts
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard"];

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const url = req.nextUrl.pathname;

  if (protectedRoutes.includes(url) && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (url === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
}