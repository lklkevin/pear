import signOutWithBackend from "@/utils/signOut";
import { useSession } from "next-auth/react";
import AccountModal from "./accountModal";

/**
 * Props for the UserDropdown component
 * @interface UserDropdownProps
 * @property {string} username - User's current username
 * @property {string} email - User's email address
 * @property {Function} setUsername - Callback function to update username
 * @property {Function} closeMenu - Callback function to close the dropdown menu
 * @property {Function} setShowPwdModal - Callback function to control password modal visibility
 * @property {boolean} showPwdModal - Controls visibility of the password modal
 * @property {Function} setShowModal - Callback function to control account modal visibility
 * @property {boolean} showModal - Controls visibility of the account modal
 */
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

/**
 * User dropdown menu component displayed when clicking user avatar
 * Provides access to account management and logout functions
 * 
 * @param {UserDropdownProps} props - Component props
 * @returns {JSX.Element} - Dropdown menu UI
 */
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
      {/* User information section */}
      <div className="p-4 border-b border-zinc-800 text-white">
        <p className="font-semibold text-lg break-all max-w-full truncate">
          {username}
        </p>
        <p className="text-sm text-zinc-400 truncate">{email}</p>
      </div>
      {/* Account management button */}
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
        {/* Account modal component */}
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

      {/* Logout button - only shown if user is authenticated */}
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
