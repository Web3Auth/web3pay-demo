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
}