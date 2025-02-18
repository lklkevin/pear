import React, { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import InputField from "../form/inputField";
import PasswordField from "../form/passwordField";
import SubmitButton from "../form/submitButton";
import Link from "next/link";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div>
      <div>
        <form className="space-y-4">
          <InputField label="Email / Username" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

          <PasswordField 
            label="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            showForgotPassword={true} 
          />

          <SubmitButton text="Log in" loading={false} />
        </form>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-zinc-700" />
          <span className="mx-2 text-zinc-400">or</span>
          <hr className="flex-grow border-zinc-700" />
        </div>

        <button className="w-full flex items-center justify-center bg-zinc-800 py-2 rounded-md hover:bg-zinc-700 transition border border-zinc-700">
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
