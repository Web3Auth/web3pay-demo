"use client";

import { useState } from "react";
import Button from "./ui/Button";
import Image from "next/image";
import Card from "./ui/Card";
import GradientButton from "./ui/GradientButton";
import axios from "axios";
import { useWallet } from "@/context/walletContext";
import { calculateBaseUrl } from "@/utils/utils";

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

  const handleEmailSubmit = async () => {
    setError(null);
    setIsLoading(true);
    try {
      if (!validateEmail(email)) {
        setError("Invalid email address. Please try again.");
        return;
      }
      // call the subscribe api here
      const baseUrl = calculateBaseUrl(selectedEnv);
      const { data } = await axios.post(`${baseUrl}/api/early-access`, {
        email,
      });
      if(data.success) {
        setSuccess(true);
        setEmail("");
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      }

      //   const response = await fetch("/api/subscribe", {
      //     method: "POST",
      //     body: JSON.stringify({
      //       email,
      //     }),
      //   });
      //   const data = await response.json();
      //   if (!response.ok) {
      //     setError(data.message);
      //     return;
      //   }
      //   if (data.status === "SUCCESS") {
      //     setSuccess(true);
      //     setEmail("");

      //     setTimeout(() => {
      //       setSuccess(false);
      //     }, 5000);
      //   }
    } catch (error) {
      console.log(error);
      setError(
        "An error occurred while processing your email. Please try again"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="w-full md:w-[90%] mx-auto rounded-3xl border border-gray-600 p-6 md:px-8 md:py-16 bg-gradient-to-br from-[#061e58] via-[#031e4d] to-[#29134c] flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-4">
        <div>
          <p className="text-[#1AC7FE] text-base font-bold uppercase">
            GET EARLY ACCESS
          </p>
          <p className="text-base md:text-xl font-semibold text-white w-full mt-2">
            Request for early access and test the new SDK before it launches to
            the public!
          </p>
        </div>
        {success ? (
          <Card>
            <div className="flex items-center justify-start gap-4 p-4">
              <Image
                src={"/images/success.svg"}
                alt="success"
                height={80}
                width={80}
              />
              <div>
                <p className="text-sm font-normal text-white">
                  Thank you for subscribing, we will send you an email
                  confirmation
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center justify-start md:justify-end gap-4 w-full">
            <div
              className={`h-11 w-full md:w-[300px] rounded-md bg-gradient-to-r from-gradient-one via-gradient-two to-gradient-five p-[1px]`}
            >
              <input
                className="h-full w-full rounded-md bg-[#031e4d] back p-4 text-base text-white focus:outline-none focus:ring-0 active:outline-none active:ring-0"
                placeholder="Email address"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                value={email}
              />
              {error && (
                <p
                  className={`text-sm text-left font-normal text-red-500 mt-1 hidden md:block`}
                >
                  {error}
                </p>
              )}
            </div>
            {error && (
              <p
                className={`text-sm text-left font-normal text-red-500 -mt-2 block md:hidden`}
              >
                {error}
              </p>
            )}

            <GradientButton
              btnClass="w-full flex justify-center md:w-max mt-0"
              handleClick={handleEmailSubmit}
              loading={isLoading}
              title="Request Early Access"
            ></GradientButton>
          </div>
        )}
      </div>
    </>
  );
};

export default NewsLetter;
