"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { TbLogout } from "react-icons/tb";
import RequireAuth from "../components/RequireAuth";
import { useAuth } from "../context/AuthContext";
import { Info } from "../checkin/page";
import { formatExpiration } from "../lib/time";

export default function CheckOut() {
  const { user } = useAuth();
  const [isNewTab, setIsNewTab] = useState<boolean>(true);
  const [checkoutTime, setCheckoutTime] = useState<string | null>(null);

  useEffect(() => {
    const reqSent = sessionStorage.getItem("checkout_request_sent");
    if (reqSent) setIsNewTab(false);
    if (user && !reqSent) {
      const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/checkout`;
      axios.post(url, { id: user.displayName });
      sessionStorage.setItem("checkout_time_iso", new Date().toISOString());
      sessionStorage.setItem("checkout_request_sent", "true");
    }

    setCheckoutTime(sessionStorage.getItem("checkout_time_iso"));
  }, [user]);

  const infochart: Info[] = [
    {
      condition: !isNewTab,
      header: "Stale Tab",
      message:
        (checkoutTime && `Checked out at ${formatExpiration(checkoutTime)}\n`) +
        "Tap again or open a new tab!",
    },
    {
      condition: Boolean(user),
      header: `See you later, ${user?.displayName}!`,
      message: "You've been removed from the roster.\nCome back soon!",
    },
    { condition: true, header: "Loading..." },
  ];
  const info = infochart.find((e) => e.condition);

  return (
    <RequireAuth>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 text-black">
        <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center gap-6 w-full max-w-md text-center">
          <TbLogout className="w-24 h-24 text-red-500" />
          <h1 className="text-2xl font-semibold">{info?.header}</h1>
          <p className="text-gray-600 whitespace-pre-line">{info?.message}</p>
        </div>
      </div>
    </RequireAuth>
  );
}
