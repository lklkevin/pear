import { ReactNode } from 'react';
import { IoClose } from "react-icons/io5";
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
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <div className="bg-zinc-900 text-white py-6 px-10 rounded-xl shadow-lg w-[28rem] mx-auto">
        <div className="grid grid-cols-[1fr_auto] items-center -mx-10 -my-6 bg-zinc-800 p-4 rounded-t-xl mb-4 h-20 relative">
          <h2 className="text-lg font-semibold text-center">{text}</h2>
          <button 
            className="text-zinc-400 hover:text-zinc-200 mr-4"
            onClick={() => {
              if (document.referrer) {
                router.back(); 
              } else {
                router.push("/"); 
              }
            }}
          >
            <IoClose size={24}/>
          </button>
        </div>
          {children}
      </div>
    </div>
    );
  };
  
  