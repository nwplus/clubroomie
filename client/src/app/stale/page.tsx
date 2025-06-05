"use client";

import { TbInfoHexagonFilled, TbLogin, TbLogout } from "react-icons/tb";
import RequireAuth from "../components/RequireAuth";
import { ReactNode, useEffect, useState } from "react";

export type Info = {
  action: "checkin" | "checkout" | "info";
  header: string;
  message?: string;
};

export const INFO_KEY = "info";

const DEFAULT_INFO: string = JSON.stringify({
  action: "info",
  header: "Stale Tab",
  message: "Tap again or use a new tab!",
});

const ICONS: Record<Info["action"], ReactNode> = {
  checkin: <TbLogin className="w-24 h-24 text-green-600" />,
  checkout: <TbLogout className="w-24 h-24 text-red-500" />,
  info: <TbInfoHexagonFilled className="w-18 h-18 text-stone-500" />,
};

export default function Stale() {
  const [info, setInfo] = useState<Info>(JSON.parse(DEFAULT_INFO));

  useEffect(() => {
    const storedInfo = sessionStorage.getItem(INFO_KEY);
    if (storedInfo) {
      setInfo(JSON.parse(storedInfo));
    }
  }, []);

  const { header, message, action } = info;

  return (
    <RequireAuth>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 text-black">
        <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center gap-6 w-full max-w-md text-center">
          {ICONS[action]}
          <h1 className="text-2xl font-semibold">{header}</h1>
          <p className="text-gray-600 whitespace-pre-line">{message}</p>
        </div>
      </div>
    </RequireAuth>
  );
}
