import { useSession } from "next-auth/react";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { Loader2, KeyRound, Trash2 } from "lucide-react";
import PasswordModal from "./passwordModal";
import signOutWithBackend from "@/utils/signOut";
import { useErrorStore, useSuccStore } from "../../store/store";
import InputField from "../form/inputField";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

/**
 * Props for the AccountModal component
 * @interface AccountModalProps
 * @property {string} email - User's email address
 * @property {string} username - User's current username
 * @property {boolean} show - Controls visibility of the modal
 * @property {Function} closeModal - Callback function to close the modal
 * @property {Function} onUsernameUpdated - Callback function to update username in parent components
 * @property {Function} setShowPwdModal - Callback function to control password modal visibility
 * @property {boolean} showPwdModal - Controls visibility of the password modal
 */
interface AccountModalProps {
  email: string;
  username: string;
  show: boolean;
  closeModal: () => void;
  onUsernameUpdated: (newUsername: string) => void;
  setShowPwdModal: (show: boolean) => void;
  showPwdModal: boolean;
}

/**
 * Account management modal component that allows users to:
 * - View their email
 * - Update their username
 * - Change their password (via PasswordModal)
 * - Delete their account
 * 
 * @param {AccountModalProps} props - Component props
 * @returns {JSX.Element | null} - Returns the modal UI or null if not shown
 */
export default function AccountModal({
  email,
  username,
  show,
  closeModal,
  onUsernameUpdated,
  setShowPwdModal,
  showPwdModal,
}: AccountModalProps) {
  const { data: session } = useSession();
  // State for tracking new username input
  const [newUsername, setNewUsername] = useState(username);
  // Status tracking for API operations
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const { setError } = useErrorStore();
  const { setSuccess } = useSuccStore();
  // Account deletion confirmation state
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  // Account deletion in progress state
  const [deleting, setDeleting] = useState(false);

  /**
   * Reset modal state when it becomes visible or username changes
   */
  useEffect(() => {
    if (show) {
      setStatus("idle");
      setNewUsername(username);
    }
  }, [show, username]);

  /**
   * Handles username update through API
   * Updates local state and fetches updated profile data
   */
  const handleUsernameChange = async () => {
    if (!session?.accessToken) return;
    setStatus("loading");
    setError("");
    setSuccess("");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/username`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({ username: newUsername }),
        }
      );
      const data = await response.json();
      if (response.ok && data.username) {
        setStatus("success");

        // Fetch updated profile to ensure we have latest data
        const profileRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/profile`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          onUsernameUpdated(profileData.username);
        } else {
          onUsernameUpdated(data.username);
        }

        setSuccess(data.message || "Successfully updated username");
      } else {
        setStatus("error");
        setError(data.message || "Failed to update username.");
      }
    } catch (error: any) {
      setStatus("error");
      setError(error.message || "Username update failed.");
    }
  };

  /**
   * Handles account deletion process
   * Sends delete request to API and signs out user on success
   */
  const handleDeleteAccount = async () => {
    setDeleting(true);
    setError("");
    setSuccess("");
    if (!session?.accessToken) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/account`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message || "Successfully deleted account.");
        signOutWithBackend(session.refreshToken);
      } else {
        setError(data.message || "Failed to delete account.");
      }
    } catch (error: any) {
      setError(error.message || "Error deleting account.");
    }
  };

  if (!show) return null;

  return createPortal(
    showPwdModal ? (
      <PasswordModal
        show={showPwdModal}
        closeModal={() => {
          setShowPwdModal(false);
        }}
      />
    ) : (
      <>
        <div
          className={`text-white h-screen justify-center sm:h-auto fixed inset-0 z-50 flex flex-col items-center bg-zinc-950/50 backdrop-blur-sm ${dmSans.className}`}
          onClick={(e) =>
            !deleting && e.target === e.currentTarget && closeModal()
          }
        >
          <div
            className="overflow-hidden justify-center w-full h-full sm:h-auto sm:max-w-[480px] sm:rounded-xl bg-zinc-950 sm:bg-zinc-900 shadow-xl relative sm:border border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            {deleting && (
              <div className="absolute inset-0 bg-black/70 z-10 flex flex-col items-center justify-center rounded-2xl text-center p-6">
                <div className="flex items-center gap-2 text-white mb-4">
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>Deleting your account...</span>
                </div>
                <p className="text-sm text-zinc-300">
                  Please do not refresh or close this window.
                </p>
              </div>
            )}

            {/* Header */}
            <div className="sm:max-w-[480px] w-full mx-auto border-b border-zinc-800 relative flex items-center sm:bg-zinc-800/35 sm:p-4 h-[72px]">
              <h2 className="mt-0.5 sm:-mt-0 w-full flex pl-4 sm:justify-center sm:pl-0 text-2xl sm:text-xl font-semibold text-white">
                My Profile
              </h2>
              <button
                onClick={!deleting ? closeModal : undefined}
                disabled={deleting}
                className="select-none absolute right-4 sm:right-10 top-1 inset-y-0 flex items-center text-zinc-400 hover:text-zinc-200 transition"
              >
                <svg
                  width="23"
                  height="23"
                  viewBox="0 0 23 23"
                  fill="transparent"
                  strokeWidth="2"
                  stroke="white"
                  strokeLinecap="round"
                >
                  <path d="M 3 2.5 L 17 16.346" />
                  <path d="M 3 16.346 L 17 2.5" />
                </svg>
              </button>
            </div>

            <div className="px-4 sm:px-10 pt-6 sm:pt-8 sm:pb-6 max-w-[480px] w-full mx-auto space-y-5">
              {/* Email Display */}
              <div>
                <label className="font-medium text-zinc-300 mb-1 block">
                  Email
                </label>
                <div className="select-none sm:bg-zinc-800/35 rounded-md border border-zinc-800 px-2.5 py-2 text-zinc-100">
                  {email}
                </div>
              </div>

              {/* Username Field */}
              <div>
                <label className="font-medium text-zinc-300 block">
                  Username
                </label>
                <InputField
                  value={newUsername}
                  auth={true}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>

              {/* Save Button */}
              <div className="flex items-center py-2">
                <button
                  onClick={handleUsernameChange}
                  disabled={
                    newUsername === username ||
                    status === "loading" ||
                    !newUsername.trim()
                  }
                  className="w-full flex items-center justify-center rounded-md bg-emerald-900 border border-emerald-400 text-white hover:bg-emerald-800 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>

              <div className="flex items-center my-4">
                <hr className="flex-grow border-zinc-700" />
              </div>

              {/* Password Change and Delete */}
              <div className="space-y-7 pt-2 pb-3">
                {session?.auth_provider === "local" && (
                  <button
                    onClick={() => {
                      setShowPwdModal(true);
                    }}
                    className="w-full flex items-center justify-center bg-zinc-800 py-2 rounded-md hover:bg-zinc-700 transition border border-zinc-700"
                  >
                    <KeyRound className="mr-2 h-4 w-4" />
                    Change Password
                  </button>
                )}
                {!confirmingDelete ? (
                  <button
                    onClick={() => setConfirmingDelete(true)}
                    className="w-full flex items-center justify-center rounded-md bg-red-800/80 hover:bg-red-700/80 border border-red-600 text-white py-2 font-medium transition"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </button>
                ) : (
                  <div className="bg-zinc-800/70 p-4 rounded-md text-base text-zinc-300 space-y-4">
                    <p className="text-center">
                      Are you sure you want to permanently delete your account?
                    </p>
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={() => setConfirmingDelete(false)}
                        disabled={deleting}
                        className="font-medium flex-1 px-4 py-2 text-base rounded bg-zinc-800 hover:bg-zinc-700 text-white transition border border-zinc-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          setDeleting(true);
                          await handleDeleteAccount();
                          setDeleting(false);
                        }}
                        className="font-medium flex-1 px-4 py-2 text-base rounded bg-red-800/80 hover:bg-red-700/80 border border-red-600 text-white transition"
                      >
                        {deleting ? "Deleting..." : "Yes, Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    ),
    document.body
  );
}
