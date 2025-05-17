"use client";

import { useAuth } from "@/app/context/AuthContext";
import { auth } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";

export default function UserNav() {
  const { user } = useAuth();
  const router = useRouter();

  const signOut = async () => {
    await auth.signOut();
    router.replace("/");
  };

  if (!user) return null;

  return (
    <div className="absolute top-4 right-4 flex items-center gap-3">
      <span className="text-sm text-gray-700">👋 {user.displayName}</span>
      <button
        onClick={signOut}
        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
      >
        Sign Out
      </button>
    </div>
  );
}
