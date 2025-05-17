"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, authChecked } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authChecked) return;

    if (!user) {
      const encoded = encodeURIComponent(pathname);
      router.replace(`/?redirect=${encoded}`);
    }
  }, [authChecked, user, pathname, router]);

  if (!authChecked || !user) return null;

  return <>{children}</>;
}
