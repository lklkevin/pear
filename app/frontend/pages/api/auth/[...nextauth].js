import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      async profile(profile) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: profile.email,
                oauth_id: profile.sub,
                username: profile.name,
              }),
            }
          );

          const responseData = await res.json();
          if (!res.ok) {
            throw new Error(
              responseData.message ||
                "Failed to sync Google user with Flask backend"
            );
          }

          return {
            id: responseData.id,
            email: responseData.email,
            name: responseData.username,
            accessToken: responseData.access_token,
            refreshToken: responseData.refresh_token,
            accessTokenExpires: Date.now() + 15 * 60 * 1000, // 15 min expiration
          };
        } catch (error) {
          console.error("Google sign-in failed:", error.message);
          throw new Error(error.message);
        }
      },
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", required: true },
        password: { label: "Password", type: "password", required: true },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          const responseData = await res.json();
          if (!res.ok) {
            throw new Error(responseData.message || "Invalid credentials");
          }

          return {
            id: responseData.id,
            email: responseData.email,
            name: responseData.username,
            accessToken: responseData.access_token,
            refreshToken: responseData.refresh_token,
            accessTokenExpires: Date.now() + 15 * 60 * 1000, // 15 min expiration
          };
        } catch (error) {
          console.error("Credentials sign-in failed:", error.message);
          throw new Error(error.message);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
        };
      }

      if (Date.now() < token.accessTokenExpires) {
        return token; // Token is still valid
      }

      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;

      if (token.error) {
        session.error = token.error;
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/signin" },
});

/**
 * Function to refresh the access token using Flask API
 */
async function refreshAccessToken(token) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/refresh`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: token.refreshToken }),
      }
    );

    const responseData = await res.json();
    if (!res.ok) {
      throw new Error(responseData.message || "Failed to refresh token");
    }

    return {
      ...token,
      accessToken: responseData.access_token,
      refreshToken: responseData.refresh_token,
      accessTokenExpires: Date.now() + 15 * 60 * 1000, // 15 min expiration
    };
  } catch (error) {
    console.error("Error refreshing token:", error.message);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}
