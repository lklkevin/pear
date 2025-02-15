import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  text: string;
}

export default function AuthLayout({ 
    children, 
    text 
}: AuthLayoutProps) {
    return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <div className="bg-zinc-900 text-white py-6 px-10 rounded-xl shadow-lg w-[28rem] mx-auto">
        <div className="grid place-items-center -mx-10 -my-6 bg-zinc-800 p-4 rounded-t-xl mb-4 h-20">
          <h2 className="text-lg font-semibold">{text}</h2>
        </div>
          {children}
      </div>
    </div>
    );
  };
  
  