/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import Card from "./ui/Card";
import Image from "next/image";
import axios from "axios";
import GradientButton from "./ui/GradientButton";
import { createPublicClient, erc20Abi, getContract, Hex, http, parseEther } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { waitForTransactionReceipt } from "viem/actions";
import { NonImportFlowStep, SelectedEnv } from "@/utils/interfaces";
import { calculateBaseUrl } from "@/utils/utils";
import { openInNewTab } from "@/utils";
import { TbExternalLink } from "react-icons/tb";
import { Modal } from "./ui/Modal";
import ErrorPopup from "./ErrorPopup";

const NonImportFlow = ({
  address,
  selectedEnv,
  handleMintNft,
}: {
  address: string;
  selectedEnv: SelectedEnv;
  handleMintNft: (address: string) => Promise<string>;
}) => {
  const [currentStep, setCurrentStep] =
    useState<NonImportFlowStep>("fundToken");
  const [stepLoader, setStepLoader] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<NonImportFlowStep[]>([
    "start",
  ]);
  const [txHash, setTxHash] = useState<string>("");
  const [nftContractLink, setNftContractLink] = useState<string>("");
  // error message
  const [errorText, setErrorText] = useState("");
  const [subErrorText, setSubErrorText] = useState("");
  const [errorRetryFunction, setErrorRetryFunction] = useState<() => Promise<void>>(() => Promise.resolve());
  const [displayErrorPopup, setDisplayErrorPopup] = useState(false);

  // step1: fund  random wallet on arbitrum
  async function fundAccount() {
    try {
      if (address) {
        setDisplayErrorPopup(false);
        setStepLoader(true);
        // check if user already has balance
        const publicClient = createPublicClient({
          chain: arbitrumSepolia,
          transport: http(
            "https://arbitrum-sepolia.infura.io/v3/dee726a2930e4573a743a5c8f79942c1"
          ),
        });
        const contract = getContract({
          abi: erc20Abi,
          address: "0xe12349b2E35F6053Ed079E281427fc1F25b3C087",
          client: publicClient,
        });
      
        // eth balance
        const [balance, tokenBalance] = await Promise.all([
          publicClient.getBalance({
            address: address as Hex,
          }), 
          contract.read.balanceOf([address as Hex])
        ]);

       
        if (balance >= parseEther("0.0001") && tokenBalance >= 30*(10**6)) {
          setCompletedSteps([...completedSteps, "fundToken"]);
          setCurrentStep("mintNft");
          return
        }
        const baseUrl = calculateBaseUrl(selectedEnv);
        const resp = await axios.post(`${baseUrl}/api/mint`, {
          chainId: "421614",
          toAddress: address,
        });
        const { txHash: hash, message } = resp.data;
      
        // hash won't be there for sufficient balance faucet use case
        if (hash) {
          setTxHash(`https://sepolia.arbiscan.io/tx/${txHash}`);
          await waitForTransactionReceipt(publicClient, {
            hash,
          });
        }
        setTxHash(`https://sepolia.arbiscan.io/address/${address}`);
        setCompletedSteps([...completedSteps, "fundToken"]);
        setCurrentStep("mintNft");
      }
    } catch (err: any) {
      console.error(`error while funding`, err.message || "");
      setErrorText("Error while Funding Wallet");
      setSubErrorText(err?.message || "");
      setErrorRetryFunction(() => fundAccount);
      setDisplayErrorPopup(true);
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
    if (address) {
      try {
        setDisplayErrorPopup(false);
        setStepLoader(true);
        const nftLink = await handleMintNft(address);
        setNftContractLink(nftLink);
        setCurrentStep("completed");
        setCompletedSteps([...completedSteps, "mintNft"]);
      } catch (err: any) {
        console.error("error  while minting NFT", err);
        setErrorText("Error while minting NFT");
        setSubErrorText(err?.message || "");
        setErrorRetryFunction(() => mintNft);
        setDisplayErrorPopup(true);
      } finally {
        setStepLoader(false);
      }
    } else {
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
    <>
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
          cardClasses={`gap-y-3 p-6 !bg-[#030226] !flex !flex-col`}
          active={currentStep === "fundToken"}
          rootClasses="!w-full sm:!w-max"
        >
          <p className="text-26 font-normal flex items-center justify-between w-full">
            01
            {completedSteps.includes("fundToken") ? (
              <Image
                src="/icons/badge-check.svg"
                alt="arrow"
                height={30}
                width={30}
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
          <p className="text-base font-bold break-words w-full md:w-[270px] text-left">
            Fund your Web3Pay Account with Arbitrum Tokens
          </p>
          <p className="text-base font-normal break-words w-full md:w-[270px] text-left text-gray-400">
            Load your Web3Pay Account with Arbitrum Test Tokens to test—our
            treat!
          </p>
          {currentStep === "fundToken" && (
            <GradientButton
              title="Get Test Tokens"
              handleClick={() => handleStep("fundToken")}
              loading={stepLoader}
              btnClass="max-sm:!w-full"
            />
          )}
          {completedSteps.includes("fundToken") && (
              <div
                onClick={() => openInNewTab(txHash)}
                className="flex items-center w-full bg-transparent rounded-full border border-gray-200 justify-center gap-x-2 py-2 opacity-45">
                <Image
                  src="/icons/arbitrum.svg"
                  alt="arrow"
                  height={20}
                  width={20}
                />{" "}
                <p className="text-base font-medium text-white">
                  Received 50 W3PTEST tokens
                </p>
              </div>
            )}
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
          cardClasses={`gap-y-3 p-6 !bg-[#030226] !flex !flex-col`}
          active={currentStep === "mintNft"}
          rootClasses="!w-full sm:!w-max"
        >
          <p className="text-26 font-normal flex items-center justify-between w-full">
            02
            {completedSteps.includes("mintNft") ? (
              <Image
                src="/icons/badge-check.svg"
                alt="arrow"
                height={30}
                width={30}
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
          <p className="text-base font-bold break-words w-[250px] text-left">
            Mint your NFT on Polygon Chain
          </p>
          <p className="text-base font-normal break-words w-[270px] text-left text-gray-400">
            Use your Arbitrum Test Tokens to mint an NFT on Polygon, no bridges
            required.
          </p>
          {currentStep === "mintNft" && (
            <GradientButton
              title="Mint NFT"
              handleClick={() => handleStep("mintNft")}
              loading={stepLoader}
            />
          )}
          {completedSteps.includes("mintNft") && (
            <div className="flex items-center w-full bg-transparent rounded-full border border-gray-200 justify-center gap-x-2 py-2" onClick={() => {
              openInNewTab(`${nftContractLink}`)
            }}>
              <p className="text-base font-medium text-white">
                NFT successfully minted
              </p>
              <TbExternalLink className="text-white text-xl" />
            </div>
          )}
        </Card>
      </div>
    </div>

    <Modal isOpen={displayErrorPopup} onClose={() => setDisplayErrorPopup(false)}>
        <ErrorPopup handleTryAgain={() => errorRetryFunction()} subText={subErrorText} text={errorText} />
      </Modal>
    </>
  );
};

export default NonImportFlow;
