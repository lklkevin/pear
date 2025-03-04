import { getSession } from "next-auth/react";

export default function Dashboard() {
  const fetchProtectedData = async () => {
    const session = await getSession(); // ensures we call the jwt callback here
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/profile`,
      {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      }
    );

    const data = await res.json();
    console.log(data);
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={fetchProtectedData}>Fetch Profile</button>
    </div>
  );
}
