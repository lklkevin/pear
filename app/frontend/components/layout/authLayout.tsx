import { ReactNode } from "react";
import Image from "next/image";

interface AuthLayoutProps {
  children: ReactNode;
  text: string;
}

export default function AuthLayout({ children, text }: AuthLayoutProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950 sm:px-8">
      <div className="absolute inset-0">
        <Image
          src="/images/hero.png"
          alt="Hero background"
          fill
          className="object-cover object-center [filter:brightness(0.8)_contrast(1.1)_saturate(1.2)_hue-rotate(-45deg)]"
          priority
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/75 to-zinc-950/75" />
      <div className="h-screen justify-center sm:h-auto sm:flex flex-col z-[998] bg-zinc-950 sm:bg-zinc-900 text-white py-6 sm:rounded-xl shadow-lg shadow-zinc-950/25 w-full sm:max-w-[28rem] mx-auto sm:border overflow-hidden border-zinc-800">
        {children}
      </div>
    </div>
  );
}
