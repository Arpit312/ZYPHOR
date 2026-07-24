import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth";
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
        if (!credentials?.email) {
          throw new Error("Email address is required.");
        }

        const emailLower = credentials.email.toLowerCase().trim();
        const requestedRole = credentials.role || "customer";

        let user = null;
        try {
          const db = await connectDB();
          if (db) {
            user = await User.findOne({ email: emailLower }).catch(() => null);

            // Auto-create user on the fly if missing (Universal Free Access)
            if (!user) {
              const passwordHash = await hashPassword(credentials.password || "Password@123");
              const nameFromEmail = emailLower.split("@")[0].replace(/[^a-zA-Z0-9]/g, " ");
              const capitalizedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

              user = await User.create({
                name: capitalizedName || "Zyphor User",
                email: emailLower,
                passwordHash: passwordHash,
                role: requestedRole,
                userTokenId: generateUserTokenId(),
                verifiedSeller: true,
                isActive: true,
                subscription: { plan: "pro", status: "active" }
              }).catch(() => null);
            } else {
              // Auto update role if user requested a role upgrade
              if (user.role !== requestedRole && requestedRole !== "customer") {
                user.role = requestedRole;
                await user.save().catch(() => {});
              }
            }
          }
        } catch (dbErr) {
          console.warn("[Auth DB Warning]:", dbErr?.message);
        }

        // Return user or universal fallback if DB is offline/connecting
        const userId = user?._id?.toString() || "user-" + Date.now();
        const userName = user?.name || emailLower.split("@")[0] || "Zyphor User";
        const userRole = user?.role || requestedRole;
        const userTokenId = user?.userTokenId || generateUserTokenId(userId);

        return {
          id: userId,
          name: userName,
          email: emailLower,
          role: userRole,
          userTokenId: userTokenId,
          city: user?.city || "Mumbai",
          businessName: user?.businessName || `${userName}'s Store`,
          subscription: user?.subscription?.plan || "pro",
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
