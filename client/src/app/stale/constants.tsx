export type Info = {
  action: "checkin" | "checkout" | "info";
  header: string;
  message?: string;
};

export const INFO_KEY = "info";
