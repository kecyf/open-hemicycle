import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID ?? "",
      clientSecret: process.env.AUTH_GITHUB_SECRET ?? "",
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin",
  },
  callbacks: {
    async signIn({ profile }) {
      const allowed = process.env.ADMIN_GITHUB_LOGIN;
      if (!allowed) return false;
      const login = (profile as { login?: string } | undefined)?.login;
      return login === allowed;
    },
  },
};
