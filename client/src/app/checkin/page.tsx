"use client";

import axios from "axios";
import { useEffect } from "react";
import { TbLogin } from "react-icons/tb";

export default function CheckIn() {
  const name = "Lincoln"; // TODO: Get dynamically from SSO

  function checkIn() {
    const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/checkin`;
    axios.post(url, {
      id: name,
    });
  }

  useEffect(() => {
    checkIn();
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <TbLogin className="w-36 h-36 green-500" />
      <h1>Welcome to the clubroom {name}!</h1>
      <p>Weve let everyone know youre here.</p>
    </div>
  );
}
