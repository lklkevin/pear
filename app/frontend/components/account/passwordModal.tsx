import { useState } from "react";
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
      className={`p-4 sm:p-0 fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm ${dmSans.className}`}
      onClick={(e) => e.target === e.currentTarget && closeModal()}
    >
      <div
        className="w-full max-w-md rounded-lg sm:rounded-xl bg-zinc-900 p-4 sm:p-6 shadow-xl relative animate-in fade-in zoom-in-95 border border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-[15px] sm:top-[23px] right-4 sm:right-6 text-white hover:text-zinc-300 transition"
        >
          <span className="text-2xl material-icons">close</span>
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold text-white text-center mb-6">
          Change Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="bg-zinc-800/50 p-4 rounded-md sm:rounded-lg">
          <label className="pl-0.5 font-medium text-zinc-400 block mb-0.5">
              Old Password
            </label>
            <PasswordField
              label=""
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>

          <div className="bg-zinc-800/50 p-4 rounded-md sm:rounded-lg space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-0.5">
              <label className="pl-0.5 font-medium text-zinc-400 block">
                New Password
              </label>
              <PasswordField
                label=""
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="pl-0.5 font-medium text-zinc-400 block">
                Confirm New Password
              </label>
              <PasswordField
                label=""
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full flex items-center justify-center rounded-md bg-emerald-900 border border-emerald-400 text-white hover:bg-emerald-800 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "loading" ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
