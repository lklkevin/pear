import { useSession } from "next-auth/react";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { Check, Loader2, X, KeyRound, Trash2 } from "lucide-react";
import PasswordModal from "./passwordModal";
import signOutWithBackend from "@/utils/signOut";
import { useErrorStore } from "../../store/store";
import InputField from "../form/inputField";

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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={(e) =>
          !deleting && e.target === e.currentTarget && closeModal()
        }
      >
        <div
          className="w-full max-w-md rounded-2xl bg-zinc-900 p-6 shadow-xl relative border border-zinc-800"
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
            className="absolute top-7 right-8 text-white hover:text-zinc-300 transition"
          >
            <X size={20} />
          </button>

          <h2 className="text-xl font-semibold text-white text-center mb-6">
            My Profile
          </h2>

          <div className="space-y-6">
            {/* Email Display */}
            <div className="bg-zinc-800/50 p-4 rounded-lg">
              <label className="text-sm font-medium text-zinc-400 mb-1 block">
                Email
              </label>
              <p className="text-zinc-100 break-words">{email}</p>
            </div>

            {/* Username Field */}
            <div className="bg-zinc-800/50 p-4 rounded-lg">
              <InputField
                label="Username"
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
              className="w-full flex items-center justify-center rounded-md bg-emerald-900 border border-emerald-400 text-white hover:bg-emerald-800 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
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
            <div className="space-y-3 pt-1">
              {session?.auth_provider === "local" && (
                <button
                  onClick={() => setShowChangePasswordModal(true)}
                  className="w-full flex items-center justify-center rounded-md bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700 text-zinc-100 py-2.5 text-sm font-medium transition"
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  Change Password
                </button>
              )}
              {!confirmingDelete ? (
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="w-full flex items-center justify-center rounded-md bg-red-800/80 hover:bg-red-700/80 border border-red-600 text-red-100 py-2.5 text-sm font-medium transition"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </button>
              ) : (
                <div className="bg-zinc-800/70 p-4 rounded-lg text-sm text-zinc-300 space-y-4">
                  <p className="text-center">
                    Are you sure you want to permanently delete your account?
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setConfirmingDelete(false)}
                      disabled={deleting}
                      className="flex-1 px-4 py-2 rounded-md bg-zinc-700/70 hover:bg-zinc-600/70 text-zinc-200 transition text-s border border-zinc-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        setDeleting(true);
                        await handleDeleteAccount();
                        setDeleting(false);
                      }}
                      className="flex-1 px-4 py-2 rounded-md bg-red-800/80 hover:bg-red-700/80 border border-red-600 text-red-100 transition text-sm"
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
