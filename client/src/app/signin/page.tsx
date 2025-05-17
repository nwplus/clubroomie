"use client";

import { useSearchParams, useRouter } from "next/navigation";
import SignInButton from "@/app/components/SignInButton";
import { Suspense, useEffect, useState } from "react";
import { auth } from "@/app/lib/firebase";

export default function SuspensefulSignIn() {
  return (
    <Suspense>
      <SignIn />
    </Suspense>
  );
}

function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const [userChecked, setUserChecked] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) {
        router.replace(redirectPath);
      } else {
        setUserChecked(true);
      }
    });
    return () => unsub();
  }, []);

  if (!userChecked) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome to Clubroomie 👋</h1>
      <p className="mb-6 text-center text-gray-600">
        Please sign in with your <strong>@nwplus.io</strong> Google account to
        continue.
      </p>
      <SignInButton redirectPath={redirectPath} />
    </div>
  );
}
