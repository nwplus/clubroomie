"use client";

import axios from "axios";
import { useEffect, useRef } from "react";
import { TbLogout } from "react-icons/tb";
import RequireAuth from "../components/RequireAuth";
import { useAuth } from "../context/AuthContext";

export default function CheckOut() {
  const { user } = useAuth();
  const hasCheckedOut = useRef(false);

  useEffect(() => {
    if (user && !hasCheckedOut.current) {
      hasCheckedOut.current = true;
      const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/checkout`;
      axios.post(url, { id: user.displayName });
    }
  }, [user]);

  return (
    <RequireAuth>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 text-black">
        <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center gap-6 w-full max-w-md text-center">
          <TbLogout className="w-24 h-24 text-red-500" />
          <h1 className="text-2xl font-semibold">
            {user ? `See you later, ${user.displayName}!` : "Loading..."}
          </h1>
          <p className="text-gray-600">
            You’ve been removed from the roster. Come back soon!
          </p>
        </div>
      </div>
    </RequireAuth>
  );
}
