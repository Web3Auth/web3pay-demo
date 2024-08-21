import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/utils/utils";
import Faq from "./ui/Faq";
import Footer from "./Footer";
import NewsLetter from "./NewsLetter";
import Navbar from "./ui/Navbar";
import CrossMintingStep from "./CrossMintingStep";
import ConnectStep from "./ConnectStep";

const STEPS = {
  CONNECT: "Connect",
  CROSS_CHAIN_MINTING: "Cross_Chain_Minting",
  VIEW_SUMMARY: "View_Summary",
};

const Home = ({ address }: { address: string }) => {
  const [activeStep, setActiveStep] = useState(STEPS.CONNECT);


  return (
    <>
      <Navbar
        address={address}
        containerClass="bg-transparent"
        logoText={activeStep === STEPS.VIEW_SUMMARY ? "About Web3Pay" : ""}
      />
      <section
        className={cn(
          "flex-grow flex flex-col items-center justify-center relative z-1 bg-darkCard py-11 px-9 w-full",
          {
            "h-dvh": activeStep !== STEPS.VIEW_SUMMARY,
          }
        )}
      >
        <Image
          src={"/images/cross-chain-gradient.png"}
          alt="cross chain"
          width={500}
          height={500}
          className="z-0 w-full h-full opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />

        <div className="mt-16 flex flex-col gap-y-16 md:gap-y-20">
          {activeStep === STEPS.VIEW_SUMMARY && (
            <div className="text-center">
              <p className="text-32 sm:banner-heading-text blue-gradient-text">
                Web3Pay Demo
              </p>
              <p className="text-base md:text-2xl font-normal text-white w-full md:w-[60%] mx-auto mt-6">
                Here’s what you experienced when leveraging your EOA’s token
                liquidity for cross-chain transactions without gas fees or
                bridges
              </p>
            </div>
          )}
          {activeStep === STEPS.CONNECT  && (
            <ConnectStep 
              onSuccess={() => {
                setActiveStep(STEPS.CROSS_CHAIN_MINTING);
              }}    
              showSummary={activeStep === STEPS.VIEW_SUMMARY}
              />
          )}
          {(activeStep === STEPS.CROSS_CHAIN_MINTING ||
            activeStep === STEPS.VIEW_SUMMARY) && (
            <CrossMintingStep 
              onSuccess={() => {
                setActiveStep(STEPS.VIEW_SUMMARY);
              }}
              showSummary={activeStep === STEPS.VIEW_SUMMARY} />
          )}
          {activeStep === STEPS.VIEW_SUMMARY && (
            <div className="flex flex-col items-center justify-center gap-y-20">
              <Faq />
              <NewsLetter />
              <Footer containerClass="mb-0 p-0 sm:px-0 w-full md:w-[90%]" />
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Home;

