import React from "react";
import Signup from "../components/signup/signupForm"; // Import Signup component

const SignupPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <Signup />
    </div>
  );
};

export default SignupPage;
