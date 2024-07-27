/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import HomeBanner from "@/components/HomeBanner";
import ImportFlow, { ImportFlowStep } from "@/components/ImportFlow";
import NonImportFlow, { NonImportFlowStep } from "@/components/NonImportFlow";
import Button from "@/components/ui/Button";
import Image from "next/image";

import Navbar from "@/components/ui/Navbar";
import { WalletProvider } from "@web3auth/global-accounts-sdk";
import { useEffect, useState } from "react";
import { HiOutlineArrowSmRight } from "react-icons/hi";

export default function Home() {
  const [walletProvider, setWalletProvider] = useState<WalletProvider>();
  const [loggedIn, setLoggedIn] = useState(walletProvider?.connected || false);
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [skipToStep, setSkipToStep] = useState("");

  // todo: change this before deployment or move it to env
  const [selectedEnv, setSelectedEnv] = useState("local");
  const [chainId, setChainId] = useState(80002);

  useEffect(() => {
    const getWalletURL = () => {
      if (selectedEnv === "local") {
        return "http://localhost:3000/connect";
      } else {
        return "https://lrc-accounts.web3auth.io/connect";
      }
    };

    // initiate sdk
    const initWalletProvider = async () => {
      setIsLoading(true);
      setWalletProvider(
        new WalletProvider({
          metadata: {
            appChainIds: [chainId],
            appName: "Demo App",
            appLogoUrl: "https://web3auth.io/images/web3authlog.png",
          },
          preference: {
            keysUrl: getWalletURL(),
          },
        })
      );
      setIsLoading(false);
      setLoggedIn(walletProvider?.connected || false);
    };
    initWalletProvider();

    // check if user is already logged in
    const getAddress = async () => {
      try {
        setLoggedIn(walletProvider?.connected || loggedIn);
        const account = (await walletProvider?.request({
          method: "eth_accounts",
          params: [],
        })) as string[];
        if (account?.length) {
          setAddress(account[0]);
        }
      } catch (err) {
        console.log(err);
        setAddress("");
      }
    };
    getAddress();
  }, [walletProvider?.connected, selectedEnv]);

  // step 0 (connect)
  async function loginOrRegister() {
    setIsLoading(true);
    try {
      const response = await walletProvider?.request({
        method: "eth_requestAccounts",
        params: [],
      });
      const loggedInAddress = (response as string[])[0];
      setAddress(loggedInAddress);
      setLoggedIn(walletProvider?.connected || false);
      // addLog(`Success full login: ${response}`);
    } catch (err) {
      console.log(`Error during login: ${JSON.stringify(err)}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex flex-col">
      <section className="lg:h-dvh bg-blend-lighten lg:bg-home bg-no-repeat bg-auto bg-scroll bg-[100%] flex-grow px-6 py-10 md:p-9 md:pb-20 flex flex-col gap-y-10 md:gap-y-20">
        <Navbar
          address={address}
          handleConnect={loginOrRegister}
          loader={isLoading}
        />
        <div className="flex flex-col text-left gap-y-6 lg:pl-16 mt-2.5">
          <div className="text-left text-3xl sm:banner-heading-text flex flex-col gap-y-1">
            <p>Experience</p>
            <p className="gradient-text">Wallet Abstraction</p>
            <p>All in One</p>
          </div>
          <p className="text-left text-2xl font-normal w-full md:w-[482px] break-words text-gray-400 hidden lg:block">
            Experience cross chain minting without the hassle of bridging
          </p>
        </div>
        <Image
          src="/images/demo-home-bg.svg"
          alt="bg"
          height={200}
          width={100}
          className="w-full lg:hidden"
        />
        <p className="text-left text-base font-normal w-full md:w-[482px] break-words text-gray-400 block lg:hidden">
          Experience cross chain minting without the hassle of bridging
        </p>
      </section>
      {walletProvider && (
        <section className="p-6 py-20 md:px-10 flex flex-col items-center justify-center w-full gap-y-10">
          <NonImportFlow
            skipToStep={skipToStep as NonImportFlowStep}
            address={address}
          />
          <ImportFlow
            skipToStep={skipToStep as ImportFlowStep}
            address={address}
          />
        </section>
      )}
    </main>
  );
}
