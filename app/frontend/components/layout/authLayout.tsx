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
        {/* Grain texture */}
        <div
          className="absolute inset-0 opacity-[0.25] mix-blend-multiply"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2' numOctaves='10' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/75 to-zinc-950/75" />
      <div className="h-screen justify-center sm:h-auto sm:flex flex-col z-[998] bg-zinc-950 sm:bg-zinc-900 text-white py-6 sm:rounded-xl shadow-lg shadow-zinc-950/25 w-full sm:max-w-[28rem] mx-auto sm:border overflow-hidden border-zinc-800">
        {children}
      </div>
    </div>
  );
}
