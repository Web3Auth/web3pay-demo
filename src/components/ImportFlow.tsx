/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import Card from "./ui/Card";
import Image from "next/image";
import axios from "axios";
import { privateKeyToAddress } from "viem/accounts";
import GradientButton from "./ui/GradientButton";

import { ImportFlowStep, IRandomWallet, SelectedEnv } from "@/utils/interfaces";
import { generatePrivate, getPublic } from "@toruslabs/eccrypto";
import { createPublicClient, Hex, http } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { arbitrumSepolia } from "viem/chains";
import { TbExternalLink } from "react-icons/tb";
import { useToast } from "@/context/ToastContext";
import { calculateBaseUrl } from "@/utils/utils";

const ImportFlow = ({
  selectedEnv,
  handleMintNft,
  handleImportAccount,
}: {
  selectedEnv: SelectedEnv;
  handleMintNft: (address: string) => Promise<void>;
  handleImportAccount: (randWallet: IRandomWallet) => Promise<void>;
}) => {
  const { addToast } = useToast();

  const [randomWallet, setRandomWallet] = useState<IRandomWallet>();
  const [currentStep, setCurrentStep] = useState<ImportFlowStep>("start");
  const [completedSteps, setCompletedSteps] = useState<ImportFlowStep[]>([]);
  const [stepLoader, setStepLoader] = useState(false);

  // step1: create random wallet
  async function handleCreateRandomWallet() {
    try {
      const privateKeyBuf = generatePrivate();
      const publicKeyBuf = getPublic(privateKeyBuf);

      const privateKey = privateKeyBuf.toString("hex");
      const publicKey = publicKeyBuf.toString("hex");

      const address = privateKeyToAddress(
        privateKey.startsWith("0x") ? (privateKey as Hex) : `0x${privateKey}`
      );

      setRandomWallet({
        publicKey,
        privateKey,
        address,
        keyType: "secp256k1",
      });
      addToast("success", "Successfully created test wallet on arbitrum chain");

      setCurrentStep("fundToken");
    } catch (err) {
      console.error("error while creating random wallet", err);
      addToast("error", "error while creating random wallet");
    }
  }

  // step2: fund  random wallet on arbitrum
  async function fundAccount() {
    try {
      if (randomWallet?.address) {
        setStepLoader(true);
        const baseUrl = calculateBaseUrl(selectedEnv);

        const resp = await axios.post(`${baseUrl}/api/mint`, {
          chainId: "421614",
          toAddress: randomWallet.address,
        });
        const { txHash: hash, message } = resp.data;

        const publicClient = createPublicClient({
          chain: arbitrumSepolia,
          transport: http(
            "https://arbitrum-sepolia.infura.io/v3/dee726a2930e4573a743a5c8f79942c1"
          ),
        });
        await waitForTransactionReceipt(publicClient, {
          hash,
        });
        // handle already funded wallet to avoid multiple funding also time limit in faucet contract
        setCurrentStep("import");
        addToast(
          "success",
          message || "Successfully Funded test wallet with arbitrum token"
        );
      }
    } catch (error) {
      console.error("error while funding", error);
      addToast("error", "Funding failed");
      // check if user has enough balance and proceed to next step
    } finally {
      setStepLoader(false);
    }
  }

  // step3: import account
  async function importAccount() {
    if (randomWallet) {
      await handleImportAccount(randomWallet);
      setCurrentStep("mintNft");
    }
  }
  // step4: mint nft
  async function mintNft() {
    if (randomWallet) {
      await handleMintNft(randomWallet.address);
    }
  }

  const handleStep = async (step: ImportFlowStep) => {
    switch (step) {
      case "create": {
        await handleCreateRandomWallet();
        setCompletedSteps([...completedSteps, "start"]);
        break;
      }
      case "fundToken":
        await fundAccount();
        setCompletedSteps([...completedSteps, "fundToken"]);
        break;
      case "import":
        await importAccount();
        setCompletedSteps([...completedSteps, "import"]);
        break;
      case "mintNft":
        await mintNft();
        setCompletedSteps([...completedSteps, "mintNft"]);
        break;
      default:
        break;
    }
  };

  return (
    <div className="w-full flex flex-col gap-y-6 mt-9">
      <div className="flex flex-col items-center gap-y-4">
        <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
          Use your Wallets with Web3Pay
        </p>
        <p className="text-lg sm:text-xl md:text-2xl font-normal w-full md:w-[45%]">
          Mint NFTs with tokens from a different chain with your existing
          wallets, no deposits required!
        </p>
      </div>
      <div
        className={`mt-10 w-full flex flex-col xl:flex-row md:gap-y-6 justify-center mx-auto ${
          completedSteps.length === 4 ? "items-stretch" : ""
        }`}
      >
        <div
          className={`flex flex-col md:flex-row items-center justify-center ${
            completedSteps.length === 4 ? "items-stretch" : ""
          }`}
        >
          {/* Card 1 */}
          <Card
            cardClasses={`gap-y-3 !bg-[#030226] p-6 ${
              currentStep === "start" || completedSteps.includes("start")
                ? "h-auto"
                : "h-full md:h-[232px]"
            }`}
            active={currentStep === "create"}
            rootClasses={`!w-full ${
              currentStep === "start" || completedSteps.includes("start")
                ? "h-auto"
                : "h-full md:h-[232px]"
            }`}
          >
            <p className="text-26 font-normal flex items-center justify-between w-full">
              01
              {completedSteps.includes("start") ? (
                <Image
                  src="/icons/badge-check.svg"
                  alt="arrow"
                  height={50}
                  width={50}
                />
              ) : (
                <Image
                  src="/icons/arbitrum.svg"
                  alt="arrow"
                  height={30}
                  width={30}
                />
              )}
            </p>
            <p className="text-base font-bold break-words w-full 2xl:w-[250px] text-left text-white">
              Create a test wallet on Arbitrum chain
            </p>
            <p className="text-base font-normal break-words w-full 2xl:w-[250px] text-left text-gray-400">
              For demo purposes, we will help you create a test wallet that will
              stand in for your external wallets
            </p>
            {currentStep === "start" && (
              <GradientButton
                loading={stepLoader}
                title="Create"
                handleClick={() => handleStep("create")}
                btnClass="max-sm:!w-full"
              />
            )}
            {completedSteps.includes("start") && (
              <div className="flex items-center w-full bg-transparent rounded-full border border-gray-200 justify-center gap-x-2 py-2 opacity-45">
                <Image
                  src="/icons/arbitrum.svg"
                  alt="arrow"
                  height={20}
                  width={20}
                />{" "}
                <p className="text-base font-medium text-white">
                  0x12345...12345
                </p>
              </div>
            )}
          </Card>
          {/* Divider */}
          <Image
            src="/icons/arrow-right.svg"
            alt="arrow"
            height={50}
            width={50}
            className="rotate-90 my-5 mx-auto block md:hidden"
          />
          <Image
            src="/icons/arrow-right.svg"
            alt="arrow"
            height={50}
            width={50}
            className="hidden md:block"
          />
          {/* Card 2 */}
          <Card
            cardClasses={`gap-y-3 !bg-[#030226] p-6 ${
              currentStep === "fundToken" ||
              completedSteps.includes("fundToken")
                ? "h-auto"
                : "h-full md:h-[232px]"
            }`}
            active={currentStep === "fundToken"}
            rootClasses={`!w-full ${
              currentStep === "fundToken" ? "h-auto" : "h-full md:h-[232px]"
            }`}
          >
            <p className="text-26 font-normal flex items-center justify-between w-full">
              02
              {completedSteps.includes("fundToken") ||
              completedSteps.includes("fundToken") ? (
                <Image
                  src="/icons/badge-check.svg"
                  alt="arrow"
                  height={50}
                  width={50}
                />
              ) : (
                <Image
                  src="/icons/arbitrum.svg"
                  alt="arrow"
                  height={30}
                  width={30}
                />
              )}
            </p>
            <p className="text-base font-bold break-words w-full 2xl:w-[250px] text-left text-white">
              Fund your Web3Pay Account with Arbitrum Tokens
            </p>
            <p className="text-base font-normal break-words w-full 2xl:w-[250px] text-left text-gray-400">
              Load your Web3Pay Account with Arbitrum Test Tokens to test—our
              treat!
            </p>
            {currentStep === "fundToken" && (
              <GradientButton
                title="fund"
                handleClick={() => handleStep("fundToken")}
                loading={stepLoader}
                btnClass="max-sm:!w-full"
              />
            )}
            {completedSteps.includes("fundToken") && (
              <div className="flex items-center w-full bg-transparent rounded-full border border-gray-200 justify-center gap-x-2 py-2 opacity-45">
                <Image
                  src="/icons/arbitrum.svg"
                  alt="arrow"
                  height={20}
                  width={20}
                />{" "}
                <p className="text-base font-medium text-white">
                  Received 0.0001 ETH
                </p>
              </div>
            )}
          </Card>
        </div>
        {/* Divider */}
        <Image
          src="/icons/arrow-right.svg"
          alt="arrow"
          height={50}
          width={50}
          className="rotate-90 my-5 mx-auto block md:hidden"
        />
        <Image
          src="/icons/arrow-right.svg"
          alt="arrow"
          height={50}
          width={50}
          className="hidden xl:block w-[28px]"
        />
        <Image
          src="/icons/arrow-right.svg"
          alt="arrow"
          height={80}
          width={50}
          className={`ml-auto rotate-90 ${
            currentStep === "fundToken" || completedSteps.includes("fundToken")
              ? "mt-0"
              : "-mt-10"
          } hidden md:block xl:hidden`}
        />
        <div
          className={`flex flex-col md:flex-row-reverse xl:flex-row items-center justify-center ${
            completedSteps.length === 4 ? "items-stretch" : ""
          }`}
        >
          {/* Card 3 */}
          <Card
            cardClasses={`gap-y-3 !bg-[#030226] p-6`}
            active={currentStep === "import"}
            rootClasses={`!w-full ${
              currentStep === "import" || completedSteps.includes("import")
                ? "h-auto"
                : "h-full md:h-[232px]"
            }`}
          >
            <p className="text-26 font-normal flex items-center justify-between w-full">
              03
              {completedSteps.includes("import") ||
              completedSteps.includes("import") ? (
                <Image
                  src="/icons/badge-check.svg"
                  alt="arrow"
                  height={50}
                  width={50}
                />
              ) : (
                <Image
                  src="/icons/arbitrum.svg"
                  alt="arrow"
                  height={30}
                  width={30}
                />
              )}
            </p>
            <p className="text-base font-bold break-words w-full 2xl:w-[250px] text-left text-white">
              Connect your test wallet to your Web3Pay Account
            </p>
            <p className="text-base font-normal break-words w-full 2xl:w-[250px] text-left text-gray-400">
              Allow your Web3Pay Account to access liquidity from your test
              wallet.
            </p>
            {currentStep === "import" && (
              <GradientButton
                title="Import"
                handleClick={() => handleStep("import")}
                btnClass="max-sm:!w-full"
              />
            )}
            {completedSteps.includes("fundToken") && (
              <div className="flex items-center w-full bg-transparent rounded-full border border-gray-200 justify-center gap-x-2 py-2 opacity-45">
                <Image
                  src="/icons/link-gradient.svg"
                  alt="arrow"
                  height={20}
                  width={20}
                />{" "}
                <p className="text-base font-medium text-white">
                  Wallet linked Successfully
                </p>
              </div>
            )}
          </Card>
          {/* Divider */}
          <Image
            src="/icons/arrow-right.svg"
            alt="arrow"
            height={50}
            width={50}
            className="rotate-90 my-5 mx-auto block md:hidden"
          />
          <Image
            src="/icons/arrow-right.svg"
            alt="arrow"
            height={50}
            width={50}
            className="hidden md:block md:rotate-180 xl:rotate-0"
          />
          {/* Card 3 */}
          <Card
            cardClasses={`gap-y-3 !bg-[#030226] p-6 ${
              currentStep === "mintNft" || completedSteps.includes("mintNft")
                ? "h-auto"
                : "h-full md:h-[232px]"
            }`}
            active={currentStep === "mintNft"}
            rootClasses={`!w-full ${
              currentStep === "mintNft" || completedSteps.includes("mintNft")
                ? "h-auto"
                : "h-full md:h-[232px]"
            }`}
          >
            <p className="text-26 font-normal flex items-center justify-between w-full">
              04
              {completedSteps.includes("mintNft") ? (
                <Image
                  src="/icons/badge-check.svg"
                  alt="arrow"
                  height={50}
                  width={50}
                />
              ) : (
                <Image
                  src="/icons/polygon.svg"
                  alt="arrow"
                  height={30}
                  width={30}
                />
              )}
            </p>
            <p className="text-base font-bold break-words w-full 2xl:w-[250px] text-left text-white">
              Mint your NFT on Polygon Chain
            </p>
            <p className="text-base font-normal break-words w-full 2xl:w-[250px] text-left text-gray-400">
              Use your Arbitrum Test Tokens to mint an NFT on Polygon, no
              bridges required.
            </p>
            {currentStep === "mintNft" && (
              <GradientButton
                title="Mint"
                handleClick={() => handleStep("mintNft")}
                btnClass="max-sm:!w-full"
              />
            )}
            {completedSteps.includes("fundToken") && (
              <div className="flex items-center w-full bg-transparent rounded-full border border-gray-200 justify-center gap-x-2 py-2">
                <p className="text-base font-medium text-white">
                  NFT successfully minted
                </p>
                <TbExternalLink className="text-white text-xl" />
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ImportFlow;
