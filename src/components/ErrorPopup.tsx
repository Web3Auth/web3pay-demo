import React from "react";
import { HiExclamationCircle } from "react-icons/hi";

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
      <HiExclamationCircle className=" text-red-500 text-5xl" />
      <div className="text-center">
        <p className="text-lg font-medium text-white">{text}</p>
        <p className="text-sm font-normal text-gray-300 text-center mt-1 mx-auto">
          {subText}
        </p>
      </div>
      <button
        className="flex justify-center items-center grow gap-2 w-full px-5 py-3 rounded-full cursor-pointer border border-gray-300"
        onClick={handleTryAgain}
      >
        <div className="text-white text-base font-medium leading-normal">
          Try again
        </div>
      </button>
    </div>
  );
};

export default ErrorPopup;
