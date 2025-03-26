import { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useErrorStore } from "../../store/store";
import PasswordField from "../form/passwordField";

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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && closeModal()}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-zinc-900 p-6 shadow-xl relative animate-in fade-in zoom-in-95 border border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-7 right-8 text-white hover:text-zinc-300 transition"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold text-white text-center mb-6">
          Change Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-zinc-800/50 p-4 rounded-lg">
            <PasswordField
              label="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>

          <div className="bg-zinc-800/50 p-4 rounded-lg space-y-4">
            <PasswordField
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <PasswordField
              label="Confirm New Password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full flex items-center justify-center rounded-md bg-emerald-900 border border-emerald-400 text-white hover:bg-emerald-800 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "loading" ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
