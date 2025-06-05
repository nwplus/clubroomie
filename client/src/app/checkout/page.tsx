"use client";

import axios from "axios";
import { useCallback, useEffect } from "react";
import RequireAuth from "../components/RequireAuth";
import { useAuth } from "../context/AuthContext";
import { Info, INFO_KEY } from "../stale/page";
import { useRouter } from "next/navigation";

export default function CheckOut() {
  const { user } = useAuth();
  const router = useRouter();

  const setInfo = useCallback(() => {
    const info: Info = {
      action: "checkout",
      header: `See you later, ${user?.displayName}!`,
      message: `You've been removed from the roster.\nThis tab is now stale.`,
    };
    sessionStorage.setItem(INFO_KEY, JSON.stringify(info));
  }, [user?.displayName]);

  const checkOut = useCallback(() => {
    if (!user) return;
    const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/checkout`;
    axios.post(url, { id: user.displayName });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    checkOut();
    setInfo();
    router.push("/stale");
  }, [user, checkOut, router, setInfo]);

  return (
    <RequireAuth>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 text-black">
        <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center gap-6 w-full max-w-md text-center">
          <h1 className="text-2xl font-semibold">Checking you out...</h1>
          <p className="text-gray-600 whitespace-pre-line">
            You will be redirected.
          </p>
        </div>
      </div>
    </RequireAuth>
  );
}
