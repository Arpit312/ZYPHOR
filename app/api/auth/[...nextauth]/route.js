import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { comparePassword } from "@/lib/auth";
import { generateUserTokenId } from "@/lib/token";

export const authOptions = {
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 Days
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "zyphor_nextauth_production_secret_key_9988",
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        await connectDB();

        // Find user by email in MongoDB
        const user = await User.findOne({ email: credentials.email.toLowerCase() });
        if (!user) {
          throw new Error("No account found with this email address.");
        }

        if (!user.isActive) {
          throw new Error("Account deactivated. Please contact support.");
        }

        // Validate password against hashed password in DB
        const isValid = await comparePassword(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error("Invalid password.");
        }

        // Auto assign userTokenId if missing
        if (!user.userTokenId) {
          user.userTokenId = generateUserTokenId(user._id);
          await user.save();
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          userTokenId: user.userTokenId,
          city: user.city || "",
          businessName: user.businessName || "",
          subscription: user.subscription?.plan || "free",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.userTokenId = user.userTokenId;
        token.city = user.city;
        token.businessName = user.businessName;
        token.subscription = user.subscription;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.userTokenId = token.userTokenId;
        session.user.city = token.city;
        session.user.businessName = token.businessName;
        session.user.subscription = token.subscription;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
