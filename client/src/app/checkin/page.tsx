"use client";

import axios from "axios";
import { Suspense, useEffect, useRef, useState } from "react";
import { TbLogin } from "react-icons/tb";
import RequireAuth from "../components/RequireAuth";
import { useAuth } from "../context/AuthContext";
import { useSearchParams } from "next/navigation";
import { formatExpiration } from "../lib/time";

const MS_IN_SEC = 1000;
const MS_IN_MIN = 60 * MS_IN_SEC;

export default function SuspensefulCheckIn() {
  return (
    <Suspense>
      <CheckIn />
    </Suspense>
  );
}

function CheckIn() {
  const { user } = useAuth();
  const hasCheckedIn = useRef(false);
  const searchParams = useSearchParams();
  const [expiration, setExpiration] = useState<string | null>(null);

  useEffect(() => {
    if (user && !hasCheckedIn.current) {
      hasCheckedIn.current = true;

      const durationParam = searchParams.get("duration") || "30";
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
    }
  }, [user, searchParams]);

  return (
    <RequireAuth>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 text-black">
        <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center gap-6 w-full max-w-md text-center">
          <TbLogin className="w-24 h-24 text-green-600" />
          <h1 className="text-2xl font-semibold">
            {user && expiration
              ? `Checked-in until ${formatExpiration(expiration)}!`
              : "Loading..."}
          </h1>
          <p className="text-gray-600">
            We’ve let everyone know you’re here. Renew your time by tapping
            again.
          </p>
        </div>
      </div>
    </RequireAuth>
  );
}
