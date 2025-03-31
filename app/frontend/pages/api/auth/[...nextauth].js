import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * Backend URL configuration
 * Falls back to public URL if backend URL is not set
 */
const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

/**
 * NextAuth configuration
 * Features:
 * - Google OAuth provider
 * - Credentials provider (email/password)
 * - JWT session handling
 * - Token refresh mechanism
 * - Custom sign-in page
 */
export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      /**
       * Custom profile handler for Google authentication
       * Syncs Google user data with backend
       * 
       * @param {Object} profile - Google profile data
       * @returns {Promise<Object>} Processed user profile with tokens
       * @throws {Error} If backend sync fails
       */
      async profile(profile) {
        try {
          const res = await fetch(
            `${backendUrl}/api/auth/google`,
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
            accessTokenExpires: Date.now() + 10 * 60 * 1000, // 10 min expiration
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
      /**
       * Credentials authentication handler
       * Validates credentials against backend
       * 
       * @param {Object} credentials - User credentials
       * @returns {Promise<Object>} Authenticated user data with tokens
       * @throws {Error} If authentication fails
       */
      async authorize(credentials) {
        try {
          const res = await fetch(
            `${backendUrl}/api/auth/login`,
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
            accessTokenExpires: Date.now() + 10 * 60 * 1000, // 10 min expiration
            auth_provider: "local",
          };
        } catch (error) {
          console.error("Credentials sign-in failed:", error.message);
          throw new Error(error.message);
        }
      },
    }),
  ],
  callbacks: {
    /**
     * JWT callback
     * Handles token creation and refresh
     * 
     * @param {Object} params - Callback parameters
     * @returns {Promise<Object>} Updated token
     */
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
          auth_provider: user.auth_provider,
        };
      }

      if (Date.now() < token.accessTokenExpires) {
        return token; // Token is still valid
      }

      return await refreshAccessToken(token);
    },
    /**
     * Session callback
     * Updates session with token data
     * 
     * @param {Object} params - Callback parameters
     * @returns {Promise<Object>} Updated session
     */
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.auth_provider = token.auth_provider;

      if (token.error) {
        session.error = token.error;
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
});

/**
 * Refreshes the access token using the backend API
 * - Attempts to refresh the token
 * - Updates user profile if successful
 * - Handles refresh failures
 * 
 * @param {Object} token - Current token object
 * @returns {Promise<Object>} Updated token with new access token or error
 */
async function refreshAccessToken(token) {
  try {
    const res = await fetch(
      `${backendUrl}/api/auth/refresh`,
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

    // Fetch the updated profile after refreshing the token.
    const profileResponse = await fetch(
      `${backendUrl}/api/user/profile`,
      {
        headers: {
          Authorization: `Bearer ${responseData.access_token}`,
        },
      }
    );
    let updatedProfile = {};
    if (profileResponse.ok) {
      updatedProfile = await profileResponse.json();
    }

    return {
      ...token,
      accessToken: responseData.access_token,
      refreshToken: responseData.refresh_token,
      accessTokenExpires: Date.now() + 10 * 60 * 1000, // 10 min expiration
      name: updatedProfile.username || token.name,
    };
  } catch (error) {
    console.error("Error refreshing token:", error.message);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}
