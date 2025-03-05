import React, { useState } from "react";
import { useRouter } from "next/router"; 
import { FaGoogle } from "react-icons/fa";
import InputField from "../form/inputField";
import PasswordField from "../form/passwordField";
import SubmitButton from "../form/submitButton";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useErrorStore } from "../../store/store";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter(); 

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    useErrorStore.getState().setError(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // Prevent auto redirect
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push("/"); 
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
    <div>
      <div>
        <form className="space-y-4" onSubmit={handleLogin}>
          <InputField label="Email / Username" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

          <PasswordField 
            label="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            showForgotPassword={true} 
          />

          <SubmitButton text="Log in" loading={loading} />
        </form>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-zinc-700" />
          <span className="mx-2 text-zinc-400">or</span>
          <hr className="flex-grow border-zinc-700" />
        </div>

        <button className="w-full flex items-center justify-center bg-zinc-800 py-2 rounded-md hover:bg-zinc-700 transition border border-zinc-700"
          onClick={() => signIn("google")}>
          <span className="mr-2"><FaGoogle /></span> Continue with Google
        </button>

        <p className="text-center text-sm text-zinc-400 mt-4">
          Don&apos;t have an account? <Link href="/signup" className="text-white underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
