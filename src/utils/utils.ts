import { twMerge } from "tailwind-merge";
import clsx, { ClassValue } from "clsx";
import { SelectedEnv } from "./interfaces";

/** Merge classes with tailwind-merge with clsx full feature */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const calculateBaseUrl = (selectedEnv: SelectedEnv) => {
  if (selectedEnv === "local") {
    return "http://localhost:3000";
  } else {
    return "https://lrc-accounts.web3auth.io";
  }
};

export const BROADCAST_LOGOUT_CHANNEL = "BROADCAST_LOGOUT";
export const MESSAGE_EVENT_LOGOUT_START = "START_LOGOUT_FROM_DEMO";
export const MESSAGE_EVENT_LOGOUT_COMPLETED = "COMPLETED_LOGOUT_FROM_DEMO";
