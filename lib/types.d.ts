import { DefaultSession, User as NextAuthUser } from "next-auth";
import { JWT } from "next-auth/jwt";

// Extend NextAuth.js's User type
export interface User extends NextAuthUser {
  token?: string; 
}


export interface Session {
  user: {
    id?: string | null; 
    accessToken?: string; 
    name?: string | null; 
    email?: string | null; 
    image?: string | null; 
  };
}


export interface ExtendedSession extends Session {
  user: {
    id?: string | null;
    accessToken?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}


export interface ExtendedJWT extends JWT {
  id?: string; 
  accessToken?: string; 
}


export interface OTPRequestResponse {
  token: string;
}

export interface OTPVerifyResponse {
  success: boolean;
}

export interface LoginResponse {
  success: boolean;
  user: {
    id: string;
    name: string | null | undefined; 
    email: string | null | undefined; 
  };
  token: string;
}
