import React, { useState } from "react";
import { useRouter } from "next/router";
import { FaGoogle } from "react-icons/fa";
import InputField from "../form/inputField";
import PasswordField from "../form/passwordField";
import SubmitButton from "../form/submitButton";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { useErrorStore } from "../../store/store";

const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Preserve last visited page
  const callbackUrl = (router.query.callbackUrl as string) || "/";

  const handleGoogle = async () => {
    const session = await getSession();

    if (session) {
      useErrorStore.getState().setError("You are already signed in!");
    } else {
      await signIn("google", { callbackUrl }); // Redirect to last visited page after Google sign-up
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    useErrorStore.getState().setError(null);

    try {
      // Send signup request to Flask backend
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, username, password }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Signup failed");
      }

      // Auto-login the user after signup
      const loginResult = await signIn("credentials", {
        email,
        password,
        redirect: false, // Prevent NextAuth from handling redirection automatically
      });

      if (loginResult?.error) {
        throw new Error(loginResult.error);
      }

      // Redirect to last visited page
      router.push(callbackUrl);
    } catch (error) {
      if (error instanceof Error) {
        useErrorStore.getState().setError(error.message || "Login failed");
      } else {
        useErrorStore.getState().setError("Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative flex items-center -mx-3 sm:-mx-10 -my-6 bg-zinc-800 p-4 rounded-t-xl mb-4 h-20">
        <h2 className="w-full flex justify-center text-lg font-semibold">
          Get Started With Us!
        </h2>
        <button
          className="absolute right-8 inset-y-0 flex items-center text-zinc-400 hover:text-zinc-200"
          onClick={() => {
            router.push(callbackUrl);
          }}
        >
          <span className="material-icons">close</span>
        </button>
      </div>
      <div>
        <div>
          <form className="space-y-4" onSubmit={handleSignup}>
            <InputField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              auth={true}
            />

            <InputField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              auth={true}
            />

            <PasswordField
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <SubmitButton text="Sign up" loading={loading} />
          </form>

          <div className="flex items-center my-4">
            <hr className="flex-grow border-zinc-700" />
            <span className="mx-2 text-zinc-400">or</span>
            <hr className="flex-grow border-zinc-700" />
          </div>

          <button
            className="w-full flex items-center justify-center bg-zinc-800 py-2 rounded-md hover:bg-zinc-700 transition border border-zinc-700"
            onClick={handleGoogle}
          >
            <span className="mr-2">
              <FaGoogle />
            </span>{" "}
            Continue with Google
          </button>

          <p className="text-center text-sm text-zinc-400 mt-4">
            Already have an account?{" "}
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="text-white underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Signup;
