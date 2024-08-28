import { twMerge } from "tailwind-merge";
import clsx, { ClassValue } from "clsx";
import { ISdkErorr, SelectedEnv } from "./interfaces";

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

export const nftContractAddress = "0xD0f3053e39040Eb2e0bc8B4eF8f7bF92636aCd25"

export const parseSdkError = (error: unknown, title?: string): { errorText: string; subErrorText: string; } => {
  if (Object.keys(error as object).includes("code")) {
    const parsedError = error as ISdkErorr;
    switch (parsedError.code) {
      case 4001:
        return {
          errorText: "Cancelled or Timed Out",
          subErrorText: "Request was either cancelled or timed out due to inactivity",
        }
      default:
        // TODO: add more cases to handle sdk error codes
    }
  }

  return {
    errorText: title || "",
    subErrorText: `Error during login: ${JSON.stringify(error)}`,
  }
}
