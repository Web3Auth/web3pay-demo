/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import Card from "./ui/Card";
import Image from "next/image";
import axios from "axios";
export type ImportFlowStep =
  | "start"
  | "create"
  | "fundToken"
  | "import"
  | "mintNft";
import { generatePrivateKey, privateKeyToAccount, privateKeyToAddress } from "viem/accounts";
import GradientButton from "./ui/GradientButton";

import { IRandomWallet } from "@/utils/interfaces";
import { generatePrivate, getPublic } from "@toruslabs/eccrypto";
import { createPublicClient, Hex, http } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { arbitrumSepolia } from "viem/chains";

const ImportFlow = ({
  address,
  skipToStep,
  handleMintNft,
  handleImportAccount,
}: {
  skipToStep: ImportFlowStep;
  address: string;
  handleMintNft: (address: string) => Promise<void>;
  handleImportAccount: (randWallet: IRandomWallet) => Promise<void>;
}) => {
  const [randomWallet, setRandomWallet] = useState<IRandomWallet>();
  const [currentStep, setCurrentStep] = useState<ImportFlowStep>("start");
  const [completedSteps, setCompletedSteps] = useState<ImportFlowStep[]>([]);
  const [stepLoader, setStepLoader] = useState(false);

  useEffect(() => {
    if (skipToStep && skipToStep != currentStep) {
      setCurrentStep(skipToStep);
    }
  }, [skipToStep]);

  // step1: create random wallet
  async function handleCreateRandomWallet() {
    const privateKeyBuf = generatePrivate();
    const publicKeyBuf = getPublic(privateKeyBuf);

    const privateKey = privateKeyBuf.toString("hex");
    const publicKey = publicKeyBuf.toString("hex");

    const address = privateKeyToAddress(privateKey.startsWith("0x") ? privateKey as Hex : `0x${privateKey}`);

    setRandomWallet({
      publicKey,
      privateKey,
      address,
      keyType: "secp256k1",
    });

    setCurrentStep("fundToken");
  }

  // step2: fund  random wallet on arbitrum
  async function fundAccount() {
    try {
      if(randomWallet?.address) {
        setStepLoader(true)
        const resp = await axios.post("https://lrc-accounts.web3auth.io/api/mint", {
          "chainId": "421614",
          "toAddress": randomWallet.address,
        });
        const { faucetHash: hash } = resp.data;

        const publicClient = createPublicClient({
          chain: arbitrumSepolia,
          transport: http("https://arbitrum-sepolia.infura.io/v3/dee726a2930e4573a743a5c8f79942c1"),
        })
        await waitForTransactionReceipt(publicClient, {
          hash,
        });
        setCurrentStep("import");
      }
    } catch (error) {
      console.error("error while funding", error);
    } finally {
      setStepLoader(false);
    }
  }

  // step3: import account
  async function importAccount() {
    if(randomWallet) {
      await handleImportAccount(randomWallet);
      setCurrentStep("mintNft");
    }
  }
  // step4: mint nft
  async function mintNft() {
    if(randomWallet) {
      await handleMintNft(randomWallet.address);
    }
  }

  const handleStep = async (step: ImportFlowStep) => {
    switch (step) {
      case "create": {
        await handleCreateRandomWallet();
        break;
      }
      case "fundToken":
        await fundAccount();
        break;
      case "import":
        await importAccount();
        break;
      case "mintNft":
        await mintNft();
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-darkCard w-max p-8 rounded-32 flex flex-col gap-y-6">
      <div className="flex items-center gap-x-6 justify-center">
        <p className="text-3xl font-bold text-white break-words w-[450px]">
          Plug and Use Any Wallet with Web3Pay
        </p>
        <div className="h-[70px] w-0.5 bg-white rounded-md break-words" />
        <p className="text-xl font-normal break-words w-[450px]">
          Try out how you can connect to any wallet to mint NFTs with token of a
          different chain!
        </p>
      </div>
      <div className="items-center justify-center gap-x-6 grid grid-cols-4">
        <Card
          cardClasses={`gap-y-5 ${
            currentStep === "start" || !completedSteps.includes("start")
              ? "h-auto"
              : "h-[157px]"
          }`}
          active={currentStep === "create"}
          rootClasses="!w-full"
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
            Create test wallet on Arbitrum chain
          </p>
          {currentStep === "start" && (
            <GradientButton
              loading={stepLoader}
              title="Create"
              handleClick={() => handleStep("create")}
            />
          )}
        </Card>
        <Card
          cardClasses={`gap-y-5 ${
            currentStep === "fundToken" || !completedSteps.includes("fundToken")
              ? "h-auto"
              : "h-[157px]"
          }`}
          active={currentStep === "fundToken"}
          rootClasses="!w-full"
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
              title="fund"
              handleClick={() => handleStep("fundToken")}
              loading={stepLoader}
            />
          )}
        </Card>
        <Card
          cardClasses={`gap-y-5 ${
            currentStep === "import" || !completedSteps.includes("import")
              ? "h-auto"
              : "h-[157px]"
          }`}
          active={currentStep === "import"}
          rootClasses="!w-full"
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
            <GradientButton
              title="Import"
              handleClick={() => handleStep("import")}
            />
          )}
        </Card>
        <Card
          cardClasses={`gap-y-5 ${
            currentStep === "mintNft" || !completedSteps.includes("mintNft")
              ? "h-auto"
              : "h-[157px]"
          }`}
          active={currentStep === "mintNft"}
          rootClasses="!w-full"
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
            Mint NFT on Polygon
          </p>
          {currentStep === "mintNft" && (
            <GradientButton
              title="Mint"
              handleClick={() => handleStep("mintNft")}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default ImportFlow;
