"use client";

import axios from "axios";
import { Suspense, useCallback, useEffect } from "react";
import RequireAuth from "../components/RequireAuth";
import { useAuth } from "../context/AuthContext";
import { useSearchParams } from "next/navigation";
import { formatExpiration } from "../lib/time";
import { Info, INFO_KEY } from "../stale/constants";
import { useRouter } from "next/navigation";

const MS_IN_SEC = 1000;
const MS_IN_MIN = 60 * MS_IN_SEC;
const DEFAULT_DURATION_MINS = "30";

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
  const router = useRouter();

  function setInfo(expirationISO: string) {
    const expiration = formatExpiration(expirationISO);

    const info: Info = {
      action: "checkin",
      header: `Checked in until ${expiration}`,
      message: `Renew your time by tapping again!\nThis tab is now stale.`,
    };
    sessionStorage.setItem(INFO_KEY, JSON.stringify(info));
  }

  const checkIn = useCallback(() => {
    if (!user) return;

    const duration = searchParams.get("duration") ?? DEFAULT_DURATION_MINS;
    const durationMinutes = parseInt(duration);
    const expirationISO = new Date(
      Date.now() + durationMinutes * MS_IN_MIN
    ).toISOString();

    axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/checkin`, {
      id: user.displayName,
      expiration: expirationISO,
    });

    return expirationISO;
  }, [user, searchParams]);

  useEffect(() => {
    if (!user) return;

    const expirationISO = checkIn() as string;
    setInfo(expirationISO);
    router.push("/stale");
  }, [user, searchParams, checkIn, router]);

  return (
    <RequireAuth>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 text-black">
        <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center gap-6 w-full max-w-md text-center">
          <h1 className="text-2xl font-semibold">Checking you in...</h1>
          <p className="text-gray-600 whitespace-pre-line">
            You will be redirected.
          </p>
        </div>
      </div>
    </RequireAuth>
  );
}
