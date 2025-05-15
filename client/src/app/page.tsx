"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-3xl font-bold">Welcome to the nwClubroom 👋</h1>

      {!user ? (
        <button
          onClick={() => router.push("/signin")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Sign In
        </button>
      ) : (
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/checkin")}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Check In
          </button>
          <button
            onClick={() => router.push("/checkout")}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Check Out
          </button>
        </div>
      )}
    </div>
  );
}
