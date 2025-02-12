import React from "react";
import Login from "../components/login/loginForm"; 


const LoginPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <Login />
    </div>
  );
};

export default LoginPage;
