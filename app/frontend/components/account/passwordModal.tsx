import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { DM_Sans } from "next/font/google";
import { useSession } from "next-auth/react";
import { useErrorStore } from "../../store/store";
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

  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
        className="justify-center pt-8 sm:pt-0 w-full h-full sm:h-auto sm:max-w-[480px] sm:rounded-xl bg-zinc-900 shadow-xl relative sm:border border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="max-w-[480px] w-full mx-auto sm:border-b border-zinc-800 relative flex items-center sm:bg-zinc-800/35 sm:p-4 h-20">
          <h2 className="w-full flex pl-8 sm:justify-center sm:pl-0 text-2xl sm:text-xl font-semibold">
            Change Password
          </h2>
          <button
            onClick={closeModal}
            className="select-none absolute right-8 sm:right-10 inset-y-0 flex items-center text-zinc-400 hover:text-zinc-200 transition"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className="px-8 sm:px-10 pt-8 pb-7 max-w-[480px] w-full mx-auto space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-medium text-zinc-300 block">
                Old Password
              </label>
              <PasswordField
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
                  label=""
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center py-3">
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
