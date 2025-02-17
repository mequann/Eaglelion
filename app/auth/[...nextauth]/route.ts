import NextAuth, { AuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { requestOTP, verifyOTP, loginWithPassword } from "@/lib/api";
import { Session, User } from "@/lib/types";

// Extend Session and JWT types
export interface ExtendedSession extends DefaultSession {
  user: DefaultSession["user"] & {
    id?: string;
    accessToken?: string;
  };
}

export interface ExtendedJWT extends JWT {
  id?: string;
  accessToken?: string;
}

export const authOptions:any = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        otp: { label: "OTP", type: "number" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          !credentials?.username ||
          !credentials?.otp ||
          !credentials?.password
        ) {
          return null;
        }

        try {
          // Step 1: Request OTP
          const otpResponse = await requestOTP(credentials.username);
          console.log(otpResponse, "otpResponse");
          const token = otpResponse.data.token;

          // Step 2: Verify OTP
          const verifyResponse = await verifyOTP(
            token,
            parseInt(credentials.otp, 10)
          );

          // Step 3: Login with Password
          const loginResponse = await loginWithPassword(
            token,
            credentials.password
          );

          if (loginResponse.data.success) {
            const user = {
              id: loginResponse.data.user.id,
              name: loginResponse.data.user.name,
              email: loginResponse.data.user.email,
              token: loginResponse.data.token,
            };
            return user;
          } else {
            return null;
          }
        } catch (error) {
          console.error("Authentication failed:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    jwt: async ({
      token,
      user,
      account,
      profile,
      trigger,
      isNewUser,
    }: {
      token: JWT;
      user: User | null;
      account: any;
      profile?: any;
      trigger?: string;
      isNewUser?: boolean;
    }) => {
      if (user) {
        token.id = user.id;
        token.accessToken = user.token || "";
      }

      if (account && isNewUser) {
        console.log("New user signed up with account:", account);
      }

      return token; // Return the token
    },

    session: async ({
      session,
      token,
    }: {
      session: any;
      token: JWT;
    }): Promise<any> => {
      if (session.user && token) {
        // console.log(session, "session");
        session.user.id = token.id as string;
        session.user.accessToken = token.accessToken as string;
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
