"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/navigation";

export default function SignInButton({
  redirectPath = "/",
}: {
  redirectPath?: string;
}) {
  const router = useRouter();

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;

      if (!email?.endsWith("@nwplus.io")) {
        alert("Only nwplus.io accounts are allowed.");
        await auth.signOut();
      } else {
        router.replace(redirectPath);
      }
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };

  return (
    <button
      onClick={signIn}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Sign in with Google
    </button>
  );
}
