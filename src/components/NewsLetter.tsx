"use client";

import { useState } from "react";
import GradientButton from "./ui/GradientButton";
import { useWallet } from "@/context/walletContext";
import { openInNewTab } from "@/utils";

const NewsLetter = () => {
  const { selectedEnv } = useWallet();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleRequestAccess = async () => {
    setError(null);
    openInNewTab("https://w3a.link/web3pay-earlyaccess")    
  };

  return (
    <>
      <div className="w-full md:w-[90%] mx-auto rounded-3xl border border-gray-600 p-6 md:px-8 md:py-16 bg-gradient-to-br from-[#061e58] via-[#031e4d] to-[#29134c] flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-4">
        <div>
          <p className="text-[#1AC7FE] text-base font-bold uppercase">
            GET EARLY ACCESS
          </p>
          <p className="text-base md:text-xl font-semibold text-white w-full mt-2">
            Sign up for early access and be among the first to test our new SDK before its public launch!
          </p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-start md:justify-end gap-4 w-full">
          <GradientButton
            btnClass="w-full flex justify-center md:w-max mt-0"
            handleClick={handleRequestAccess}
            loading={isLoading}
            title="Request Early Access"
          ></GradientButton>
        </div>
      </div>
    </>
  );
};

export default NewsLetter;
