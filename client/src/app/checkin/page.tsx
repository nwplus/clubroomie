"use client";

import axios from "axios";
import { Suspense, useEffect, useState } from "react";
import { TbLogin } from "react-icons/tb";
import RequireAuth from "../components/RequireAuth";
import { useAuth } from "../context/AuthContext";
import { useSearchParams } from "next/navigation";
import { formatExpiration } from "../lib/time";

export type Info = {
  condition: boolean;
  header: string;
  message?: string;
};

const MS_IN_SEC = 1000;
const MS_IN_MIN = 60 * MS_IN_SEC;
const DEFAULT_DURATION = 30;

export default function SuspensefulCheckIn() {
  return (
    <Suspense>
      <CheckIn />
    </Suspense>
  );
}

function CheckIn() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [expiration, setExpiration] = useState<string | null>(null);
  const [isNewTab, setIsNewTab] = useState<boolean>(true);

  useEffect(() => {
    const reqSent = sessionStorage.getItem("checkin_request_sent");
    if (reqSent) setIsNewTab(false);
    if (user && !reqSent) {
      const durationParam =
        searchParams.get("duration") || DEFAULT_DURATION.toString();
      const durationMinutes = durationParam ? parseInt(durationParam) : null;
      const expirationISO =
        durationMinutes &&
        new Date(Date.now() + durationMinutes * MS_IN_MIN).toISOString();
      setExpiration(expirationISO as string | null);

      const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/checkin`;
      axios.post(url, {
        id: user.displayName,
        expiration: expirationISO ?? null,
      });
      sessionStorage.setItem("checkin_request_sent", "true");
    }
  }, [user, searchParams]);

  const formattedExpiration = formatExpiration(expiration as string);

  const infochart: Info[] = [
    {
      condition: !isNewTab,
      header: "Stale Tab",
      message: `Last signed in until ${formattedExpiration}\nTap again or open a new tab!`,
    },
    {
      condition: Boolean(user),
      header: `Checked-in until ${formattedExpiration}!`,
      message: `We notified everyone!\nRenew your time by tapping again.`,
    },
    { condition: true, header: "Loading..." },
  ];
  const info = infochart.find((e) => e.condition);

  return (
    <RequireAuth>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 text-black">
        <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center gap-6 w-full max-w-md text-center">
          <TbLogin className="w-24 h-24 text-green-600" />
          <h1 className="text-2xl font-semibold">{info?.header}</h1>
          <p className="text-gray-600 whitespace-pre-line">{info?.message}</p>
        </div>
      </div>
    </RequireAuth>
  );
}
