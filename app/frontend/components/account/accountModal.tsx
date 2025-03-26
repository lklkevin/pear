import { useSession } from "next-auth/react";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { Check, Loader2, KeyRound, Trash2 } from "lucide-react";
import PasswordModal from "./passwordModal";
import signOutWithBackend from "@/utils/signOut";
import { useErrorStore } from "../../store/store";
import InputField from "../form/inputField";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});


interface AccountModalProps {
  email: string;
  username: string;
  show: boolean;
  closeModal: () => void;
  onUsernameUpdated: (newUsername: string) => void;
}

export default function AccountModal({
  email,
  username,
  show,
  closeModal,
  onUsernameUpdated,
}: AccountModalProps) {
  const { data: session } = useSession();
  const [newUsername, setNewUsername] = useState(username);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const { setError } = useErrorStore();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (show) {
      setStatus("idle");
      setNewUsername(username);
    }
  }, [show, username]);

  const handleUsernameChange = async () => {
    if (!session?.accessToken) return;
    setStatus("loading");
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
      } else {
        setStatus("error");
        setError(data.message || "Failed to update username.");
      }
    } catch (error: any) {
      setStatus("error");
      setError(error.message || "Username update failed.");
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
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
    <>
      <div
        className={`p-4 sm:p-0 fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm ${dmSans.className}`}
        onClick={(e) =>
          !deleting && e.target === e.currentTarget && closeModal()
        }
      >
        <div
          className="w-full max-w-md rounded-lg sm:rounded-xl bg-zinc-900 p-4 sm:p-6 shadow-xl relative border border-zinc-800"
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

          {/* Close Button */}
          <button
            onClick={!deleting ? closeModal : undefined}
            disabled={deleting}
            className="absolute top-3.5 right-4 sm:right-6 sm:top-[22px] text-white hover:text-zinc-300 transition"
          >
            <span className="text-2xl material-icons">close</span>
          </button>

          <h2 className="text-xl font-semibold text-white text-center mb-4">
            My Profile
          </h2>

          <div className="space-y-4 sm:space-y-6">
            {/* Email Display */}
            <div className="bg-zinc-800/50 p-4 rounded-md sm:rounded-lg">
              <label className="pl-0.5 font-medium text-zinc-400 mb-0.5 block">
                Email
              </label>
              <p className="pl-0.5 text-zinc-100 break-words">{email}</p>
            </div>

            {/* Username Field */}
            <div className="bg-zinc-800/50 p-4 rounded-md sm:rounded-lg">
              <label className="pl-0.5 font-medium text-zinc-400 mb-1 block">
                Username
              </label>
              <InputField
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
              {status === "success" && (
                <div className="mt-1 text-green-400 flex items-center space-x-1 text-sm">
                  <Check className="h-4 w-4" />
                  <span>Username updated</span>
                </div>
              )}
            </div>

            {/* Save Button */}
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

            {/* Divider */}
            <hr className="border-zinc-700 my-2" />

            {/* Password Change and Delete */}
            <div className="space-y-4 sm:space-y-6">
              {session?.auth_provider === "local" && (
                <button
                  onClick={() => setShowChangePasswordModal(true)}
                  className="w-full flex items-center justify-center rounded-md bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700 text-white py-2 font-medium transition"
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
                <div className="bg-zinc-800/70 p-4 rounded-lg text-base text-zinc-300 space-y-4">
                  <p className="text-center">
                    Are you sure you want to permanently delete your account?

                  </p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => setConfirmingDelete(false)}
                      disabled={deleting}
                      className="font-medium flex-1 px-4 py-2 text-base rounded-md bg-zinc-700/70 hover:bg-zinc-600/70 text-white transition border border-zinc-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        setDeleting(true);
                        await handleDeleteAccount();
                        setDeleting(false);
                      }}
                      className="font-medium flex-1 px-4 py-2 text-base rounded-md bg-red-800/80 hover:bg-red-700/80 border border-red-600 text-white transition"
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

      {showChangePasswordModal && (
        <PasswordModal
          show={showChangePasswordModal}
          closeModal={() => setShowChangePasswordModal(false)}
        />
      )}
    </>,
    document.body
  );
}
