/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import Card from "./ui/Card";
import Image from "next/image";
import axios from "axios";
import GradientButton from "./ui/GradientButton";
export type NonImportFlowStep = "start" | "fundToken" | "mintNft";

const NonImportFlow = ({
  address,
  skipToStep,
}: {
  skipToStep: NonImportFlowStep;
  address: string;
}) => {
  const [currentStep, setCurrentStep] =
    useState<NonImportFlowStep>("fundToken");
  const [completedSteps, setCompletedSteps] = useState<NonImportFlowStep[]>([]);
  const [stepLoader, setStepLoader] = useState(false);

  useEffect(() => {
    if (skipToStep && skipToStep != currentStep) {
      setCurrentStep(skipToStep);
    }
  }, [skipToStep]);

  // step1: create random wallet
  async function handleCreateRandomWallet() {
    // TODO: create random key pair
    try {
      if (address) {
        setStepLoader(true);
        const txnHash = await axios.post(
          "https://lrc-accounts.web3auth.io/api/mint",
          {
            chainId: "421614",
            toAddress: address,
          }
        );
        // TODO: wait for txn
        setCurrentStep("mintNft");
      }
    } catch (error) {
      console.error("error while funding", error);
    } finally {
      setStepLoader(false);
    }
  }

  // step1: fund  random wallet on arbitrum
  async function fundAccount() {
    if (address) {
      const txnHash = await axios.post(
        "https://lrc-accounts.web3auth.io/api/mint",
        {
          chainId: "421614",
          toAddress: address,
        }
      );
      // TODO: wait for txn
      setCurrentStep("mintNft");
    }
  }
  // step2: mint nft
  async function mintNft() {
    if (address) {
    }
  }

  const handleStep = async (step: NonImportFlowStep) => {
    switch (step) {
      case "fundToken":
        await fundAccount();
        break;

      case "mintNft":
        await mintNft();
        break;
      default:
        break;
    }
  };

  return (
    <div className="w-full flex flex-col gap-y-6 mt-9">
      <div className="flex flex-col items-center gap-y-4">
        <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
          Cross Chain Transactions within Web3Pay
        </p>
        <p className="text-lg sm:text-xl md:text-2xl font-normal w-full md:w-[70%]">
          Mint NFTs seamlessly with tokens from a different chain in one simple
          click!
        </p>
      </div>
      <div className="mt-10 w-full flex items-center flex-col sm:flex-row sm:items-stretch justify-center">
        <Card
          cardClasses={`gap-y-3 p-6 md:!p-9 !bg-[#030226] !flex !flex-col !justify-between`}
          active
          rootClasses="!w-full sm:!w-max"
        >
          <p className="text-26 font-normal flex items-center justify-between w-full">
            01
            <Image
              src="/icons/arbitrum.svg"
              alt="arrow"
              height={30}
              width={30}
            />
          </p>
          <p className="text-base font-bold break-words w-full md:w-[270px] text-left">
            Fund your Web3Pay Account with Arbitrum Tokens
          </p>
          <p className="text-base font-normal break-words w-full md:w-[270px] text-left text-gray-400">
            Load your Web3Pay Account with Arbitrum Test Tokens to test—our
            treat!
          </p>
          <GradientButton
            title="Get Test Tokens"
            handleClick={() => handleStep("fundToken")}
            loading={stepLoader}
            btnClass="max-sm:!w-full"
          />
        </Card>
        <Image
          src="/icons/arrow-right.svg"
          alt="arrow"
          height={50}
          width={50}
          className="rotate-90 my-5 mx-auto block sm:hidden"
        />
        <Image
          src="/icons/arrow-right.svg"
          alt="arrow"
          height={50}
          width={50}
          className="hidden sm:block"
        />
        <Card
          cardClasses={`gap-y-3 p-6 md:!p-9 !bg-[#030226] !flex !flex-col !justify-between`}
          active
          rootClasses="!w-full sm:!w-max"
        >
          <p className="text-26 font-normal flex items-center justify-between w-full">
            02
            <Image
              src="/icons/polygon.svg"
              alt="arrow"
              height={30}
              width={30}
            />
          </p>
          <p className="text-base font-bold break-words w-[250px] text-left">
            Mint your NFT on Polygon Chain
          </p>
          <p className="text-base font-normal break-words w-[270px] text-left text-gray-400">
            Use your Arbitrum Test Tokens to mint an NFT on Polygon, no bridges
            required.
          </p>
          <GradientButton
            title="Mint NFT"
            handleClick={() => handleStep("mintNft")}
            btnClass="max-sm:!w-full"
          />
        </Card>
      </div>
    </div>
  );
};

export default NonImportFlow;
