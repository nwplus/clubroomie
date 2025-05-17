export function formatExpiration(iso: string) {
  const date = new Date(iso);
  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Los_Angeles", // PST/PDT
  };
  return new Intl.DateTimeFormat("en-US", options).format(date).toLowerCase(); // e.g., "4:20 PM"
}
