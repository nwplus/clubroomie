"use client";

import axios from "axios";
import { useEffect } from "react";
import { TbLogout } from "react-icons/tb";

export default function CheckIn() {
  const name = "Lincoln"; // TODO: Get dynamically from SSO

  function checkOut() {
    const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/checkout`;
    axios.post(url, {
      id: name,
    });
  }

  useEffect(() => {
    checkOut();
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <TbLogout className="w-36 h-36 fill-red-200" />
      <h1>See you later {name}!</h1>
      <p>Youve been removed from the roster.</p>
    </div>
  );
}
