"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    if (user === null) {
      const encoded = encodeURIComponent(pathname);
      router.replace(`/?redirect=${encoded}`);
    } else if (user) {
      setCheckedAuth(true);
    }
  }, [user]);

  if (!checkedAuth) return null;

  return <>{children}</>;
}
