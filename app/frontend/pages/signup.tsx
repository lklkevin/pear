import React from "react";
import Signup from "../components/auth/signupForm"; 
import AuthLayout from "@/components/layout/authLayout";

const SignupPage: React.FC = () => {
  return (
    <AuthLayout text="Get started with Company">
      <div>
        <Signup />
      </div>
    </AuthLayout>
  );
};

export default SignupPage;
