import { useState } from "react";
import { signIn, signOut, useSession, getSession } from "next-auth/react";
import signOutWithBackend from "@/utils/signOut";

export default function AuthButtons() {
  const { data: session } = useSession();
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignIn = async (provider, credentials = {}) => {
    try {
      const result = await signIn(provider, { 
        ...credentials, 
        redirect: false 
      });
      
      if (result?.error) {
        setErrorMessage(result.error);
      } else {
        setErrorMessage(""); // Clear previous errors
        
        // You may need to check the session for errors after a successful sign-in
        const session = await getSession();
        if (session?.error) {
          setErrorMessage(session.error);
        }
      }
    } catch (error) {
      setErrorMessage(error.message || "Sign-in failed");
    }
  };

  return (
    <div>
      {session ? (
        <>
          <p>Signed in as {session.user.email}</p>
          <button onClick={() => signOutWithBackend(session?.refreshToken)}>
            Sign Out
          </button>
        </>
      ) : (
        <>
          <button onClick={() => handleSignIn("google")}>
            Sign in with Google
          </button>
          <button
            onClick={() =>
              handleSignIn("credentials", {
                email: "a@gmail.com",
                password: "a",
              })
            }
          >
            Sign in with Credentials
          </button>
          {errorMessage && (
            <p style={{ color: "red", marginTop: "1rem" }}>{errorMessage}</p>
          )}
        </>
      )}
    </div>
  );
}
