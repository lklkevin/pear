import React from "react";
import Login from "../components/auth/loginForm"; 
import AuthLayout from "@/components/layout/authLayout";


const LoginPage: React.FC = () => {
  return (
    <AuthLayout text="Welcome back!">
      <div>
        <Login />
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
