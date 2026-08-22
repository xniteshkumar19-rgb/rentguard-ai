import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

const isRealGoogleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_ID !== "your-client-id" &&
  process.env.GOOGLE_CLIENT_ID !== "your-google-client-id" &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_SECRET !== "your-client-secret" &&
  process.env.GOOGLE_CLIENT_SECRET !== "your-google-client-secret"
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    ...(isRealGoogleConfigured
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    Credentials({
      name: "Demo Login",
      credentials: {
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        const role = credentials?.role as string | undefined;
        if (role === "tenant") {
          return {
            id: "demo-tenant",
            name: "Alex Mercer (Tenant Demo)",
            email: "alex@example.com",
            image: null,
          };
        }
        if (role === "manager") {
          return {
            id: "demo-manager",
            name: "Sarah Lin (Manager Demo)",
            email: "sarah.lin@rentalhub.org",
            image: null,
          };
        }
        return {
          id: "aditi-sharma",
          name: "Aditi Sharma",
          email: "aditi.sharma@rentguard.ai",
          image: null,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as typeof session.user & { id: string }).id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "rentguard-hackathon-secret-2026-rentguard-ai",
});
