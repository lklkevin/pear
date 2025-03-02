import { ReactNode } from 'react';
import { useRouter } from "next/router"; 

interface AuthLayoutProps {
  children: ReactNode;
  text: string;
}

export default function AuthLayout({ 
    children, 
    text 
}: AuthLayoutProps) {
    const router = useRouter();

    return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950 px-6">
      <div className="bg-zinc-900 text-white py-6 px-10 rounded-xl shadow-lg w-full max-w-[28rem] mx-auto">
        <div className="relative flex items-center -mx-10 -my-6 bg-zinc-800 p-4 rounded-t-xl mb-4 h-20">
          <h2 className="w-full flex justify-center text-lg font-semibold">{text}</h2>
          <button 
            className="absolute right-8 inset-y-0 flex items-center text-zinc-400 hover:text-zinc-200"
            onClick={() => {
              if (window.history.length > 1) {
                router.back(); 
              } else {
                router.push("/"); 
              }
            }}
          >
            <span className="material-icons">
            close
            </span>
          </button>
        </div>
          {children}
      </div>
    </div>
    );
  };
  
  