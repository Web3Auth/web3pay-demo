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
    <div className="mt-16 ml-20 flex items-center">
      <Card
        cardClasses={`gap-y-5 ${
          currentStep === "start" || !completedSteps.includes("fundToken")
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
          Fund Global Account with Arbitrum token
        </p>
        {currentStep === "fundToken" && (
          <GradientButton
            title="fund"
            handleClick={() => handleStep("fundToken")}
            loading={stepLoader}
          />
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
        <p className="text-base font-medium break-words">Mint NFT on Polygon</p>
        {currentStep === "mintNft" && (
          <GradientButton
            title="Mint"
            handleClick={() => handleStep("mintNft")}
          />
        )}
      </Card>
    </div>
  );
};

export default NonImportFlow;
