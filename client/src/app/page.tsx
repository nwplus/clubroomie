"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/app/lib/firebase";
// import SignInButton from "@/app/components/SignInButton";
// import { User } from "firebase/auth";

export default function HomePage() {
  // const [user, setUser] = useState<User | null>(null);
  const [userChecked, setUserChecked] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      // setUser(currentUser);
      setUserChecked(true);

      if (currentUser && redirectPath !== "/") {
        router.replace(redirectPath);
      }
    });

    return () => unsubscribe();
  }, [redirectPath, router]);

  if (!userChecked) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <h1>It worked!</h1>
      {/* <h1 className="text-3xl font-bold">Welcome to the nwClubroom 👋</h1>

      {!user ? (
        <>
          <p className="text-center text-gray-600">
            Please sign in with your <strong>@nwplus.io</strong> Google account
            to continue.
          </p>
          <SignInButton redirectPath={redirectPath} />
        </>
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
      )} */}
    </div>
  );
}
