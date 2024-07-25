"use client";

import React from "react";
import Card from "./ui/Card";
import Image from "next/image";
import Loader from "./ui/Loader";

const Steps = () => {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([]);

  const handleStep = (step: number) => {
    if (step !== 0) {
      setCurrentStep(step);
      setCompletedSteps((prev) => [...prev, step - 1]);
    } else {
      setCurrentStep(0);
      setCompletedSteps((prev) => [...prev, 4]);
    }
  };

  return (
    <div className="mt-16 ml-20 flex items-center">
      <Card
        cardClasses={`gap-y-5 ${
          currentStep === 1 || !completedSteps.includes(1)
            ? "h-auto"
            : "h-[157px]"
        }`}
        active={currentStep === 1}
      >
        <p className="text-26 font-normal flex items-center justify-between w-full">
          01
          {completedSteps.includes(1) && (
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
        {currentStep === 1 && (
          <GradientButton title="Connect" handleClick={() => handleStep(2)} />
        )}
      </Card>
      <Image src="/icons/arrow-right.svg" alt="arrow" height={50} width={50} />
      <Card
        cardClasses={`gap-y-5 ${
          currentStep === 2 || !completedSteps.includes(2)
            ? "h-auto"
            : "h-[157px]"
        }`}
        active={currentStep === 2}
      >
        <p className="text-26 font-normal flex items-center justify-between w-full">
          02
          {completedSteps.includes(2) && (
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
        {currentStep === 2 && (
          <GradientButton
            title="Connect"
            handleClick={() => handleStep(3)}
            loading
          />
        )}
      </Card>
      <Image src="/icons/arrow-right.svg" alt="arrow" height={50} width={50} />
      <Card
        cardClasses={`gap-y-5 ${
          currentStep === 3 || !completedSteps.includes(3)
            ? "h-auto"
            : "h-[157px]"
        }`}
        active={currentStep === 3}
      >
        <p className="text-26 font-normal flex items-center justify-between w-full">
          03
          {completedSteps.includes(3) && (
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
        {currentStep === 3 && (
          <GradientButton title="Import" handleClick={() => handleStep(4)} />
        )}
      </Card>
      <Image src="/icons/arrow-right.svg" alt="arrow" height={50} width={50} />
      {completedSteps}
      <Card
        cardClasses={`gap-y-5 ${
          currentStep === 4 || !completedSteps.includes(4)
            ? "h-auto"
            : "h-[157px]"
        }`}
        active={currentStep === 4}
      >
        <p className="text-26 font-normal flex items-center justify-between w-full">
          04
          {completedSteps.includes(4) && (
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
        {currentStep === 4 && (
          <GradientButton title="Mint" handleClick={() => handleStep(0)} />
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
