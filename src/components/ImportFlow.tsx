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
import { sliceAddress, openInNewTab } from "@/utils";

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
  const [txHash, setTxHash] = useState<string>("");
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
      setCompletedSteps([...completedSteps, "start"]);
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
        setTxHash(hash);
        const publicClient = createPublicClient({
          chain: arbitrumSepolia,
          transport: http(
            "https://arbitrum-sepolia.infura.io/v3/dee726a2930e4573a743a5c8f79942c1"
          ),
        });
        if (hash) {
          await waitForTransactionReceipt(publicClient, {
            hash,
          });
        }
        // handle already funded wallet to avoid multiple funding also time limit in faucet contract
        setCurrentStep("import");
        setCompletedSteps([...completedSteps, "fundToken"]);
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
      try {
        setStepLoader(true);
        await handleImportAccount(randomWallet);
        addToast("success", "Successfully imported account");
        setCurrentStep("mintNft");
        setCompletedSteps([...completedSteps, "import"]);
      } catch (err: any) {
        console.error("error while importing account", err);
        addToast("error", `error while importing account ${err?.message}`);
      } finally {
        setStepLoader(false);
      }
    } else {
      addToast("error", "Wallet not created!");
    }
  }
  // step4: mint nft
  async function mintNft() {
    if (randomWallet) {
      try {
        setStepLoader(true);
        await handleMintNft(randomWallet.address);
        addToast("success", "Successfully Minted NFT!");
      } catch (err: any) {
        console.error("error while importing account", err);
        addToast("error", `error while minting nft ${err?.message}`);
      } finally {
        setStepLoader(false);
        setCompletedSteps([...completedSteps, "mintNft"]);
        setCurrentStep("completed");
      }
    } else {
      addToast("error", "Wallet not created!");
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
          <ImportFlowCard
            title="Create a test wallet on Arbitrum chain"
            description=" For demo purposes, we will help you create a test wallet that will
              stand in for your external wallets"
            step="1"
            isCompleted={completedSteps.includes("start")}
            isCurrent={currentStep === "start"}
            logo="arbitrum"
            resultOpacity
            resultText="0x12345...12345"
            resultLogo="arbitrum"
            handleClick={() => handleStep("create")}
            btnText="Create"
          />
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
          <ImportFlowCard
            title="Fund your Web3Pay Account with Arbitrum Tokens"
            description="Load your Web3Pay Account with Arbitrum Test Tokens to test—our
              treat!"
            step="2"
            isCompleted={completedSteps.includes("fundToken")}
            isCurrent={currentStep === "fundToken"}
            logo="arbitrum"
            resultOpacity
            resultText="Received 0.0001 ETH"
            resultLogo="arbitrum"
            handleClick={() => handleStep("fundToken")}
            btnText="Fund"
          />
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
          <ImportFlowCard
            title="Connect your test wallet to your Web3Pay Account"
            description="Allow your Web3Pay Account to access liquidity from your test
              wallet."
            step="3"
            isCompleted={completedSteps.includes("import")}
            isCurrent={currentStep === "import"}
            logo="arbitrum"
            resultOpacity
            resultText="Wallet linked Successfully"
            resultLogo="link-gradient"
            handleClick={() => handleStep("import")}
            btnText="Import"
          />
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
          <ImportFlowCard
            title="Mint your NFT on Polygon Chain"
            description="Use your Arbitrum Test Tokens to mint an NFT on Polygon, no
              bridges required."
            step="4"
            isCompleted={completedSteps.includes("mintNft")}
            isCurrent={currentStep === "mintNft"}
            logo="polygon"
            resultOpacity
            resultText="NFT successfully minted"
            resultCustomIcon={<TbExternalLink className="text-white text-xl" />}
            handleClick={() => handleStep("mintNft")}
            btnText="Mint"
          />
        </div>
      </div>
    </div>
  );
};

export default ImportFlow;

const ImportFlowCard = ({
  isCurrent = false,
  isCompleted = false,
  title,
  description,
  handleClick,
  resultOpacity,
  logo,
  resultText,
  resultLogo,
  step,
  resultCustomIcon,
  btnText,
}: {
  isCurrent: boolean;
  isCompleted: boolean;
  title: string;
  description: string;
  handleClick: () => void;
  resultOpacity: boolean;
  logo: string;
  resultText: string;
  resultLogo?: string;
  resultCustomIcon?: React.ReactNode;
  step: string;
  btnText: string;
}) => {
  return (
    <Card
      cardClasses={`gap-y-3 !bg-[#030226] p-6 ${
        isCurrent || isCompleted ? "h-auto" : "h-full md:h-[232px]"
      }`}
      active={isCurrent}
      rootClasses={`!w-full ${
        isCurrent || isCompleted ? "h-auto" : "h-full md:h-[232px]"
      }`}
    >
      <p className="text-26 font-normal flex items-center justify-between w-full">
        0{step}
        {isCompleted ? (
          <Image
            src="/icons/badge-check.svg"
            alt="completed"
            height={50}
            width={50}
          />
        ) : (
          <Image src={`/icons/${logo}.svg`} alt={logo} height={30} width={30} />
        )}
      </p>
      <p className="text-base font-bold break-words w-full 2xl:w-[250px] text-left text-white">
        {title}
      </p>
      <p className="text-base font-normal break-words w-full 2xl:w-[250px] text-left text-gray-400">
        {description}
      </p>
      {isCurrent && (
        <GradientButton
          title={btnText}
          handleClick={() => handleClick()}
          btnClass="max-sm:!w-full"
        />
      )}
      {isCompleted && (
        <div
          className={`flex items-center w-full bg-transparent rounded-full border border-gray-200 justify-center gap-x-2 py-2 ${
            resultOpacity ? "opacity-45" : ""
          }`}
        >
          {resultLogo && (
            <Image
              src={`/icons/${resultLogo}.svg`}
              alt={resultLogo}
              height={20}
              width={20}
            />
          )}
          <p className="text-base font-medium text-white">{resultText}</p>
          {resultCustomIcon ?? null}
        </div>
      )}
    </Card>
  );
};
