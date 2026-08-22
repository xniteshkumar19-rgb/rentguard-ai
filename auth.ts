import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    // Demo credentials for hackathon judges — no Google OAuth setup needed
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
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
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
  secret: process.env.NEXTAUTH_SECRET ?? "rentguard-dev-secret-change-in-prod",
});
