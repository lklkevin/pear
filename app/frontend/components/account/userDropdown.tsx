import signOutWithBackend from "@/utils/signOut";
import { useSession } from "next-auth/react";
import AccountModal from "./accountModal";

interface UserDropdownProps {
  username: string;
  email: string;
  setUsername: (name: string) => void;
  closeMenu: () => void;
  setShowPwdModal: (show: boolean) => void;
  showPwdModal: boolean;
  setShowModal: (show: boolean) => void;
  showModal: boolean;
}

export default function UserDropdown({
  username,
  email,
  setUsername,
  closeMenu,
  setShowPwdModal,
  showPwdModal,
  setShowModal,
  showModal,
}: UserDropdownProps) {
  const { data: session } = useSession();

  return (
    <div
      className="absolute top-full right-0 z-50 w-60 bg-zinc-950/75 backdrop-blur-lg border border-zinc-800 rounded-lg shadow-lg -mt-2 mr-8"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4 border-b border-zinc-800 text-white">
        <p className="font-semibold text-lg break-all max-w-full truncate">
          {username}
        </p>
        <p className="text-sm text-zinc-400 truncate">{email}</p>
      </div>
      <div>
        <button
          className="select-none font-medium tracking-tight w-[calc(100%-1rem)] m-2 px-2 py-2 text-white flex items-center gap-2 hover:bg-zinc-700 hover:rounded-md hover:bg-opacity-50"
          onClick={() => {
            setShowModal(true);
          }}
        >
          <span className="material-icons">person_outline</span>
          Account
        </button>
        <AccountModal
          email={email}
          username={username}
          show={showModal}
          closeModal={() => {
            setShowModal(false);
            closeMenu();
          }}
          onUsernameUpdated={setUsername}
          setShowPwdModal={setShowPwdModal}
          showPwdModal={showPwdModal}
        />
      </div>

      {session && (
        <button
          onClick={() => {
            signOutWithBackend(session?.refreshToken);
            closeMenu();
          }}
          className="select-none pl-[9px] font-medium tracking-tight w-[calc(100%-1rem)] m-2 px-2 py-2 text-white flex items-center gap-2 hover:bg-zinc-700 hover:rounded-md hover:bg-opacity-50"
        >
          <span className="material-icons scale-90">logout</span>
          Log Out
        </button>
      )}
    </div>
  );
}
