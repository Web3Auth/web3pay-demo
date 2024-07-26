"use client";

import React, { useEffect, useState } from "react";
import Card from "./ui/Card";
import Image from "next/image";
import Loader from "./ui/Loader";
import { WalletProvider } from "@web3auth/global-accounts-sdk";
import axios from "axios";
import { generatePrivate, getPublic } from "@toruslabs/eccrypto";
import { OpenloginSessionManager } from "@toruslabs/session-manager";
export type Step = "start" | "import" | "mintNft" | "connect" | "fundToken";

const Steps = ({
  loginOrRegister,
  address,
  skipToStep,
  chainId,
  walletProvider,
  handleMintNft,
  handleImportAccount,
}: {
  loginOrRegister(): Promise<void>;
  skipToStep: Step;
  address: string;
  chainId: number;
  walletProvider: WalletProvider;
  handleMintNft: (address: string) => Promise<void>;
  handleImportAccount: () => Promise<void>;
}) => {
  const [currentStep, setCurrentStep] = useState<Step>("start");
  const [completedSteps, setCompletedSteps] = useState<Step[]>([]);

  // set the current step 
  useEffect(() => {
    if(currentStep) {
      const handleSteps = async () => {
        switch (currentStep) {
          case "connect": {
            // await handleConnect();
            break;
          }
          case "fundToken":
            // await fundAccount();
            break;
          case "import":
            // await importAccount();
            break;
          case "mintNft":
            // await mintNft();
            break;
          default:
            break;
        }
      }
      handleSteps();
    }
  }, [currentStep]);


  useEffect(() => {
    if(skipToStep && skipToStep != currentStep) {
      setCurrentStep(skipToStep);
    }
  }, [skipToStep]);
  
  // step1: login
  async function handleConnect() {
    await loginOrRegister();
    // existingUser ? setCurrentStep("import") : setCurrentStep("fundToken");
  }

  // step2: fund account
  async function fundAccount() {
    if(address) {
      console.log(`Funding account: ${address}`);
      const txnHash = await axios.post("https://lrc-accounts.web3auth.io/api/mint", {
        "chainId": chainId.toString(),
        "toAddress": address,
      });
      console.log({txnHash});
      setCurrentStep("import");
    }
  }

  // step3: import account
  async function importAccount() {
    await handleImportAccount();
    setCurrentStep("mintNft");
  }
  // step4: mint nft
  async function mintNft() {
    if(address) {
      setCurrentStep("mintNft");
      handleMintNft(address);
    }
  }

  const handleStep = async (step: Step) => {
    setCurrentStep(step);
    await importAccount()
  };

  return (
    <div className="mt-16 ml-20 flex items-center">
      {/* connect */}
      <Card
        cardClasses={`gap-y-5 ${
          currentStep === "start" || !completedSteps.includes("start")
            ? "h-auto"
            : "h-[157px]"
        }`}
        active={currentStep === "fundToken"}
      >
        <p className="text-26 font-normal flex items-center justify-between w-full">
          01
          {completedSteps.includes("start") && (
            <Image
              src="/icons/badge-check.svg"
              alt="arrow"
              height={50}
              width={50}
            />
          )}
        </p>
        <p className="text-base font-medium break-words w-[250px]">
          Create test wallet on Polygon chain
        </p>
        {currentStep === "start" && (
          <GradientButton title="Connect" handleClick={() => handleStep("connect")} />
        )}
      </Card>
      <Image src="/icons/arrow-right.svg" alt="arrow" height={50} width={50} />
      <Card
        cardClasses={`gap-y-5 ${
          currentStep === "fundToken" || !completedSteps.includes("fundToken")
            ? "h-auto"
            : "h-[157px]"
        }`}
        active={currentStep === "fundToken"}
      >
        <p className="text-26 font-normal flex items-center justify-between w-full">
          02
          {completedSteps.includes("fundToken") && (
            <Image
              src="/icons/badge-check.svg"
              alt="arrow"
              height={50}
              width={50}
            />
          )}
        </p>
        <p className="text-base font-medium break-words w-[250px]">
          Fund test wallet with Arbitrum token
        </p>
        {currentStep === "fundToken" && (
          <GradientButton
            title="Connect"
            handleClick={() => handleStep("connect")}
            loading
          />
        )}
      </Card>
      <Image src="/icons/arrow-right.svg" alt="arrow" height={50} width={50} />
      <Card
        cardClasses={`gap-y-5 ${
          currentStep === "import" || !completedSteps.includes("import")
            ? "h-auto"
            : "h-[157px]"
        }`}
        active={currentStep === "import"}
      >
        <p className="text-26 font-normal flex items-center justify-between w-full">
          03
          {completedSteps.includes("import") && (
            <Image
              src="/icons/badge-check.svg"
              alt="arrow"
              height={50}
              width={50}
            />
          )}
        </p>
        <p className="text-base font-medium break-words w-[250px]">
          Import test wallet liquidity into global account
        </p>
        {currentStep === "import" && (
          <GradientButton title="Import" handleClick={importAccount} />
        )}
      </Card>
      <Image src="/icons/arrow-right.svg" alt="arrow" height={50} width={50} />
      {completedSteps}
      <Card
        cardClasses={`gap-y-5 ${
          currentStep === "mintNft" || !completedSteps.includes("mintNft")
            ? "h-auto"
            : "h-[157px]"
        }`}
        active={currentStep === "mintNft"}
      >
        <p className="text-26 font-normal flex items-center justify-between w-full">
          04
          {completedSteps.includes("mintNft") && (
            <Image
              src="/icons/badge-check.svg"
              alt="arrow"
              height={50}
              width={50}
            />
          )}
        </p>
        <p className="text-base font-medium break-words">
          Mint NFT on yyy chain
        </p>
        {currentStep === "mintNft" && (
          <GradientButton title="Mint" handleClick={mintNft} />
        )}
      </Card>
    </div>
  );
};

const GradientButton = ({
  title,
  handleClick,
  loading,
}: {
  title: string;
  handleClick: () => void;
  loading?: boolean;
}) => {
  return (
    <button
      className="gradient-btn relative w-fit rounded-full px-12 py-4 flex items-center justify-center"
      onClick={() => handleClick && handleClick()}
    >
      {loading ? <Loader size="xs" /> : title}
    </button>
  );
};

export default Steps;
