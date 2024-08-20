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
}) => {
  return (
    <Card
      cardClasses={`gap-y-3 !bg-[#030226] p-6`}
      active
      rootClasses={`!w-full ${
        isCurrent || isCompleted ? "h-auto" : "h-full md:h-[233px]"
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
          loading={loading}
        />
      )}
      {isCompleted && (
        <div
          className={`flex items-center w-full bg-transparent rounded-full border border-gray-200 justify-center gap-x-2 py-2 ${
            resultOpacity ? "opacity-45" : ""
          }`}
          onClick={handleCompletedLink}
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

export default ImportFlowCard;
