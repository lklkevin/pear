import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { FaGoogle } from "react-icons/fa";
import InputField from "../form/inputField";
import PasswordField from "../form/passwordField";
import SubmitButton from "../form/submitButton";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useErrorStore } from "../../store/store";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  // Retrieve the last visited page from query params or default to "/"
  const callbackUrl = (router.query.callbackUrl as string) || "/";

  useEffect(() => {
    // If the user already has a valid session, redirect to the last visited page
    if (session) {
      router.push(callbackUrl);
    }
  }, [session, router, callbackUrl]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    useErrorStore.getState().setError(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // Prevent NextAuth from handling redirection automatically
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Redirect to last visited page or default to "/"
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
    <div className="flex h-full sm:h-auto flex-col">
      <div className="max-w-[480px] w-full mx-auto sm:border-b border-zinc-800 relative flex items-center -my-6 sm:bg-zinc-800/35 sm:p-4 mb-0 sm:mb-4 h-20">
        <h2 className="w-full flex pl-8 sm:justify-center sm:pl-0 text-2xl sm:text-xl font-semibold">
          Welcome Back
        </h2>
        <button
          className="absolute right-8 sm:right-10 inset-y-0 flex items-center text-zinc-400 hover:text-zinc-200"
          onClick={() => {
            router.push(callbackUrl);
          }}
        >
          <span className="material-icons">close</span>
        </button>
      </div>
      <div className="px-8 sm:px-10 max-w-[480px] w-full mx-auto sm:mx-0">
        <div>
          <form className="space-y-5" onSubmit={handleLogin}>
            <InputField
              label="Email"
              auth={true}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <PasswordField
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showForgotPassword={false}
            />

            <SubmitButton text="Log in" loading={loading} />
          </form>

          <div className="flex items-center my-4">
            <hr className="flex-grow border-zinc-700" />
            <span className="mx-2 text-zinc-400">or</span>
            <hr className="flex-grow border-zinc-700" />
          </div>

          <button
            className="w-full flex items-center justify-center bg-zinc-800 py-2 rounded-md hover:bg-zinc-700 transition border border-zinc-700"
            onClick={() => signIn("google", { callbackUrl })}
          >
            <span className="mr-2">
              <FaGoogle />
            </span>{" "}
            Continue with Google
          </button>

          <p className="text-center text-sm text-zinc-400 mt-4">
            Don&apos;t have an account?{" "}
            <Link
              href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="text-white underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
