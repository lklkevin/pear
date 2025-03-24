import Link from "next/link";
import signOutWithBackend from "@/utils/signOut";
import { useSession } from "next-auth/react";
import AccountModal from "./accountModal";
import { useState } from "react";

export default function UserDropdown({
  name,
  email,
  closeMenu,
}: {
  name: string;
  email: string;
  closeMenu: () => void;
}) {
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);

  return (
    <div
      className="absolute top-full right-0 z-50 w-60 bg-zinc-500 border border-zinc-800 rounded-lg shadow-lg mt-3 bg-opacity-10 backdrop-blur-md"
      onClick={(e) => e.stopPropagation()} // Prevents closing dropdown when clicking inside it
    >
      <div className="p-4 border-b border-zinc-800 text-white">
        <p className="font-semibold text-lg break-all max-w-full">{name}</p>
        <p className="text-xs text-zinc-400 break-words">{email}</p>
      </div>
      <div>
        <button
          className="w-[calc(100%-1rem)] m-2 px-2 py-2 text-white flex items-center gap-2 hover:bg-zinc-700 hover:rounded-md hover:bg-opacity-50"
          onClick={() => {
            setShowModal(true);
          }}
        >
          <span className="material-icons">person_outline</span>
          Account
        </button>
        <AccountModal
          email={email}
          username={name}
          show={showModal}
          closeModal={() => {
            setShowModal(false);
            closeMenu();
          }}
        />
      </div>

      {session && (
        <button
          onClick={() => {
            signOutWithBackend(session?.refreshToken);
            closeMenu();
          }}
          className="w-[calc(100%-1rem)] m-2 px-2 py-2 text-white flex items-center gap-2 hover:bg-zinc-700 hover:rounded-md hover:bg-opacity-50"
        >
          <span className="material-icons scale-90">logout</span>
          Log Out
        </button>
      )}
    </div>
  );
}
