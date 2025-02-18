import React, { useState } from "react";
import { FaEyeSlash, FaEye, FaGoogle } from "react-icons/fa";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <div className="bg-zinc-900 text-white py-6 px-10 rounded-xl shadow-lg w-[28rem] mx-auto">

        <div className="grid place-items-center -mx-10 -my-6 bg-zinc-800 p-6 rounded-t-xl mb-6 h-18">
          <h2 className="text-lg font-semibold">Welcome back!</h2>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300">Email / Username</label>
            <input
              type="email"
              className="w-full p-2 mt-1 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <label className="flex justify-between text-sm font-medium text-zinc-300">
                Password
                <a href="#" className="text-white underline">Forgot Password?</a> 
            </label>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full p-2 mt-1 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="mr-1 absolute right-3 top-9 text-zinc-400 hover:text-zinc-200"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button className="w-full bg-zinc-100 text-black py-2 rounded-md hover:bg-zinc-300 transition !mt-8">
            Log in
          </button>
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
          Don&apos;t have an account? <a href="#" className="text-white underline">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
