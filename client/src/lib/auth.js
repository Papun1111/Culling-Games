import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // 1. JWT Callback: Runs when user logs in
    // We capture the Google ID Token here
    async jwt({ token, account }) {
      if (account) {
        token.id_token = account.id_token;
      }
      return token;
    },
    // 2. Session Callback: Runs when client checks "useSession()"
    // We pass the token to the browser so we can send it to the Backend
    async session({ session, token }) {
      session.id_token = token.id_token;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};