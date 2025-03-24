import { useSession } from "next-auth/react";
import ReactDOM from "react-dom";
import React from "react";
import { FaRegEdit } from "react-icons/fa";
import { useState } from "react";

export default function AccountModal({
  email,
  username,
  show,
  closeModal,
}: {
  email: string;
  username: string;
  show: boolean;
  closeModal: () => void;
}) {
  const [newUsername, setNewUsername] = useState("");
  const { data: session } = useSession();

  const data = async () => {
    const response = await fetch("");
  };

  const handleUsernameChange = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/username`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ username: newUsername }),
        }
      );
      const data = await response.json();
      console.log(data);
    } catch {}
  };

  if (!show) {
    return null;
  }
  return ReactDOM.createPortal(
    <div className="bg-zinc-950 bg-opacity-35 backdrop-blur-md fixed inset-0 top-0 left-0 z-50 flex justify-center items-center">
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg w-96 p-4 m-4">
        <div className="flex item-center justify-center h-10 w-full">
          <h2 className="text-zinc-100 text-lg font-semibold">My Profile</h2>
        </div>
        <button
          className="text-zinc-100 absolute right-4 top-4"
          onClick={closeModal}
        >
          <span className="material-icons">close</span>
        </button>
        <div className="space-y-4">
          <div>
            <p className="text-zinc-300">Email</p>
            <p className="text-xs text-zinc-400 break-words">{email}</p>
          </div>
          <p className="text-zinc">Username</p>
          <div className="flex flex-row items-center justify-between">
            <p className="text-zinc-300">{username}</p>
            <FaRegEdit />
          </div>
          <button className="w-full bg-zinc-700 text-white py-2 rounded-md">
            Change Password
          </button>
          <button className="w-full bg-red-700 text-white py-2 rounded-md">
            Delete Account
          </button>
          <button
            className="w-full bg-zinc-700 text-white py-2 rounded-md"
            onClick={handleUsernameChange}
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
