import { ReactNode } from "react";
import { useRouter } from "next/router";

interface AuthLayoutProps {
  children: ReactNode;
  text: string;
}

export default function AuthLayout({ children, text }: AuthLayoutProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950 px-2 sm:px-6">
      <div className="bg-zinc-900 text-white py-6 px-3 sm:px-10 rounded-xl shadow-lg w-full max-w-[28rem] mx-auto">
        {children}
      </div>
    </div>
  );
}
