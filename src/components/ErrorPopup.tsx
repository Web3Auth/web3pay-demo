import React from "react";
import Button from "./ui/Button";
import { AiOutlineExclamation } from "react-icons/ai";

const ErrorPopup = ({
  text,
  subText,
  handleTryAgain,
}: {
  text: string;
  subText: string;
  handleTryAgain: () => Promise<void>;
}) => {
  return (
    <div className="w-full flex flex-col gap-y-4 items-center justify-center">
      {/* todo: add caution symbol */}
      <AiOutlineExclamation className="bg-red-500 text-gray-800 text-xl h-10 w-10 rounded-full" />
      <div className="text-center">
        <p className="text-lg font-medium text-white">{text}</p>
        <p className="text-sm font-normal text-white text-center mt-1 mx-auto">
          {subText}
        </p>
      </div>
      <div
        className="flex justify-center items-center grow gap-2 w-full px-5 py-3 rounded-full cursor-pointer border border-gray-300"
        onClick={handleTryAgain}
      >
        <div className="text-white text-base font-medium font-['Inter'] leading-normal">
          Try again
        </div>
      </div>
    </div>
  );
};

export default ErrorPopup;
