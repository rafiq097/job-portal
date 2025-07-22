import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "./generated/prisma";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

const prisma = new PrismaClient();
export const { auth, handlers, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "email", placeholder: "Email" },
        password: {
          label: "password",
          type: "password",
          placeholder: "Password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if(!user || !(await compare(credentials.password, user.password))) {
          return null;
        }

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
});
