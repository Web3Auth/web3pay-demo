import React from "react";
import Image from "next/image";
import GradientButton from "./GradientButton";
import Card from "./Card";

const ImportFlowCard = ({
  isCurrent = false,
  isCompleted = false,
  title,
  description,
  handleClick,
  handleCompletedLink,
  resultOpacity,
  logo,
  resultText,
  resultLogo,
  step,
  resultCustomIcon,
  btnText,
  loading,
  gradientBtnClass,
}: {
  isCurrent: boolean;
  isCompleted: boolean;
  title: string;
  description: string;
  handleClick: () => void;
  handleCompletedLink?: () => void;
  resultOpacity: boolean;
  logo: string;
  resultText: string;
  resultLogo?: string;
  resultCustomIcon?: React.ReactNode;
  step: string;
  loading: boolean;
  btnText: string;
  gradientBtnClass?: string;
}) => {
  return (
    <Card
      cardClasses={`gap-y-3 !bg-[#030226] p-6`}
      active
      rootClasses={`!w-full !h-auto`}
    >
      <p className="text-26 font-normal flex items-center justify-between w-full">
        0{step}
        <div className="h-9 w-9 flex flex-col items-center justify-center">
          {isCompleted ? (
            <Image
              src="/icons/badge-check.svg"
              alt="completed"
              height={36}
              width={36}
            />
          ) : (
            <Image
              src={`/icons/${logo}.svg`}
              alt={logo}
              height={30}
              width={30}
            />
          )}
        </div>
      </p>
      <p className="text-base font-bold break-words w-full text-left text-white">
        {title}
      </p>
      <p className="text-base font-normal break-words w-full text-left text-gray-400">
        {description}
      </p>
      {isCurrent && (
        <GradientButton
          title={btnText}
          handleClick={() => handleClick()}
          btnClass={`max-sm:!w-full ${gradientBtnClass}`}
          loading={loading}
        />
      )}
      {isCompleted && (
        <Card
          rootClasses="w-full cursor-pointer"
          cardClasses={`flex flex-row bg-primary items-center w-full rounded-full justify-center gap-x-2 !p-2 hover:cursor-pointer`}
          handleClick={handleCompletedLink}
          active
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
        </Card>
      )}
    </Card>
  );
};

export default ImportFlowCard;
