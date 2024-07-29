/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import Card from "./ui/Card";
import Image from "next/image";
import axios from "axios";
import GradientButton from "./ui/GradientButton";
import { useToast } from "@/context/ToastContext";
import { createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { waitForTransactionReceipt } from "viem/actions";
import { NonImportFlowStep, SelectedEnv } from "@/utils/interfaces";
import { calculateBaseUrl } from "@/utils/utils";

const NonImportFlow = ({
  address,
  selectedEnv,
  handleMintNft,
}: {
  address: string;
  selectedEnv: SelectedEnv;
  handleMintNft: (address: string) => Promise<void>;
}) => {
  const { addToast } = useToast();
  const [currentStep, setCurrentStep] =
    useState<NonImportFlowStep>("fundToken");
  const [stepLoader, setStepLoader] = useState(false);

  // step1: fund  random wallet on arbitrum
  async function fundAccount() {
    try {
      if (address) {
        setStepLoader(true);
        const baseUrl = calculateBaseUrl(selectedEnv);
        const resp = await axios.post(
          `${baseUrl}/api/mint`,
          {
            chainId: "421614",
            toAddress: address,
          }
        );
        const { txHash: hash, message } = resp.data;

        const publicClient = createPublicClient({
          chain: arbitrumSepolia,
          transport: http("https://arbitrum-sepolia.infura.io/v3/dee726a2930e4573a743a5c8f79942c1"),
        });
        addToast("success", message || "Successfully Funded test wallet with arbitrum token");
        // hash won't be there for sufficient balance faucet use case
        if(hash) {
          await waitForTransactionReceipt(publicClient, {
            hash,
          });
        }
        setCurrentStep("mintNft");
      }

    } catch(err) {
      console.error(`error while funding`, err);
      addToast("error", "Funding failed");
      throw err;
      // handle error
      // check for user balance on asset needed for minting 
      // if already available proceed to funding
    } finally {
      setStepLoader(false);
    }
  }
  // step2: mint nft
  async function mintNft() {
     try {
      if (address) {
        setStepLoader(true);
        await handleMintNft(address);
      }
     } catch (error) {
      console.error("error while minting", error);
     } finally {
       setStepLoader(false);
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
    <div className="bg-darkCard w-max p-8 rounded-32 flex flex-col gap-y-6">
      <div className="flex items-center gap-x-6">
        <p className="text-3xl font-bold text-white break-words w-[450px]">
          Cross Chain Transactions within Web3Pay
        </p>
        <div className="h-[70px] w-0.5 bg-white rounded-md break-words" />
        <p className="text-xl font-normal break-words w-[450px]">
          Try out how you can mint NFTs with tokens of a different chain in just
          one click!{" "}
        </p>
      </div>
      <div className="items-stretch justify-center gap-x-6 grid grid-cols-2 px-24">
        <Card cardClasses={`gap-y-5 p-9`} active rootClasses="!w-full">
          <p className="text-26 font-normal flex items-center justify-between w-full">
            01
            <Image
              src="/icons/arbitrum.svg"
              alt="arrow"
              height={30}
              width={30}
            />
          </p>
          <p className="text-base font-medium break-words w-[270px]">
            Fund your Web3Pay Account with Arbitrum Test Tokens for free
          </p>

          <GradientButton
            title="Get Test Tokens"
            handleClick={() => handleStep("fundToken")}
            loading={stepLoader}
          />
        </Card>

        <Card cardClasses={`gap-y-5 p-9`} active rootClasses="!w-full">
          <p className="text-26 font-normal flex items-center justify-between w-full">
            02
            <Image
              src="/icons/polygon.svg"
              alt="arrow"
              height={30}
              width={30}
            />
          </p>
          <p className="text-base font-medium break-words w-[250px]">
            Mint an NFT on Polygon chain using your Arbitrum Test Tokens
          </p>
          <GradientButton
            title="Mint NFT"
            handleClick={() => handleStep("mintNft")}
          />
        </Card>
      </div>
    </div>
  );
};

export default NonImportFlow;
