import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { DM_Sans } from "next/font/google";
import { useSession } from "next-auth/react";
import { useErrorStore, useSuccStore } from "../../store/store";
import PasswordField from "../form/passwordField";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function PasswordModal({
  show,
  closeModal,
}: {
  show: boolean;
  closeModal: () => void;
}) {
  const { data: session } = useSession();
  const { setError } = useErrorStore();
  const { setSuccess } = useSuccStore();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword) {
      setError("New password cannot be empty.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/password`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({
            oldPassword,
            password: newPassword,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Failed to update password.");
      } else {
        setSuccess(data.message || "Successfully updated password.");
        closeModal();
      }
    } catch (error) {
      setError((error as any).message || "Failed to update password.");
    } finally {
      setStatus("idle");
    }
  };

  if (!show) return null;

  return createPortal(
    <div
      className={`h-screen justify-center sm:h-auto fixed inset-0 z-[100] flex flex-col items-center bg-zinc-950/50 backdrop-blur-sm ${dmSans.className}`}
      onClick={(e) => e.target === e.currentTarget && closeModal()}
    >
      <div
        className="overflow-hidden justify-center w-full h-full sm:h-auto sm:max-w-[480px] sm:rounded-xl bg-zinc-950 sm:bg-zinc-900 shadow-xl relative sm:border border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className=" sm:max-w-[480px] w-full mx-auto border-b border-zinc-800 relative flex items-center sm:bg-zinc-800/35 sm:p-4 h-[72px]">
          <h2 className="mt-0.5 sm:-mt-0 w-full flex pl-4 sm:justify-center sm:pl-0 text-2xl sm:text-xl font-semibold text-white">
            Change Password
          </h2>
          <button
            aria-label="Close"
            onClick={closeModal}
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

        <div className="px-4 sm:px-10 pt-6 sm:pt-8 pb-8 max-w-[480px] w-full mx-auto space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-medium text-zinc-300 block">
                Old Password
              </label>
              <PasswordField
                id="old-password"
                label=""
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>

            <div className="space-y-5">
              <div>
                <label className="font-medium text-zinc-300 block">
                  New Password
                </label>
                <PasswordField
                  id="new-password"
                  label=""
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="font-medium text-zinc-300 block">
                  Confirm New Password
                </label>
                <PasswordField
                  id="confirm-new-password"
                  label=""
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center py-2">
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full flex items-center justify-center rounded-md bg-emerald-900 border border-emerald-400 text-white hover:bg-emerald-800 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "loading" ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
