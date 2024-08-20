import React from "react";
import Image from "next/image";
import Card from "./Card";
import GradientButton from "./GradientButton";
import { ImportFlowStep } from "@/utils/interfaces";
import { TbExternalLink } from "react-icons/tb";
import { openInNewTab } from "@/utils";

const NFTCard = ({
  currentStep,
  completedSteps,
  stepLoader,
  mintState,
  handleStep,
}: {
  currentStep: ImportFlowStep;
  completedSteps: ImportFlowStep[];
  stepLoader: boolean;
  mintState: {
    minting: boolean;
    mintSuccess: boolean;
    mintError: string;
    mintRedirectUrl: string;
  };
  handleStep: (step: ImportFlowStep) => void;
}) => {
  return (
    <Card
      cardClasses={`gap-y-3 !bg-[#030226] p-6`}
      active
      rootClasses={`!w-full ${
        currentStep === "mintNft" || completedSteps.includes("mintNft")
          ? "h-auto"
          : "h-full md:h-[233px]"
      }`}
    >
      <p className="text-26 font-normal flex items-center justify-between w-full">
        04
        {completedSteps.includes("mintNft") ? (
          <Image
            src="/icons/badge-check.svg"
            alt="arrow"
            height={30}
            width={30}
          />
        ) : (
          <Image src="/icons/polygon.svg" alt="arrow" height={30} width={30} />
        )}
      </p>
      {!completedSteps.includes("mintNft") && currentStep !== "mintNft" && (
        <>
          <p className="text-base font-bold break-words w-full 2xl:w-[250px] text-left text-white">
            Mint your NFT on Polygon Chain
          </p>
          <p className="text-base font-normal break-words w-full 2xl:w-[250px] text-left text-gray-400">
            Use your Arbitrum Test Tokens to mint an NFT on Polygon, no bridges
            required.
          </p>
        </>
      )}
      {currentStep === "mintNft" && (
        <>
          <p className="text-base font-bold break-words w-full 2xl:w-[250px] text-left text-white">
            Mint your NFT on Polygon Chain
          </p>
          <p className="text-base font-normal break-words w-full 2xl:w-[250px] text-left text-gray-400">
            Use your Arbitrum Test Tokens to mint an NFT on Polygon, no bridges
            required.
          </p>
          <GradientButton
            title="Mint NFT"
            handleClick={() => handleStep("mintNft")}
            loading={stepLoader}
          />
        </>
      )}
      {
        completedSteps.includes("mintNft") &&
          // miniting
          (!mintState.mintSuccess ? (
            <>
              <p className="text-base font-bold break-words w-full 2xl:w-[250px] text-left text-white">
                Mint your NFT on Polygon Chain
              </p>
              <p className="text-base font-normal break-words w-full 2xl:w-[250px] text-left text-gray-400">
                Use your Arbitrum Test Tokens to mint an NFT on Polygon, no
                bridges required.
              </p>
              <div
                className="flex items-center w-full bg-transparent rounded-full border border-gray-200 justify-center gap-x-2 py-2"
                onClick={() => {
                  openInNewTab(mintState.mintRedirectUrl);
                }}
              >
                <p className="text-base font-medium text-white">
                  NFT successfully minted
                </p>
                <TbExternalLink className="text-white text-xl" />
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col justify-around gap-y-4">
                <Image
                  src="/images/erc-721-success.svg"
                  alt="success"
                  width={250}
                  height={108}
                  className="animate-scaleIn text-center m-auto"
                />
                <div
                  className="flex items-center w-full bg-transparent rounded-full border border-gray-200 justify-center gap-x-2 py-2"
                  onClick={() => {
                    openInNewTab(`${mintState.mintRedirectUrl}`);
                  }}
                >
                  <p className="text-base font-medium text-white">
                    View Transaction
                  </p>
                  <TbExternalLink className="text-white text-xl" />
                </div>
              </div>
            </>
          ))

        // minted
      }
    </Card>
  );
};

export default NFTCard;
