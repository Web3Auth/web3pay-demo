import Image from "next/image";
import React from "react";

const MintSuccess = () => {
  return (
    <div className="w-full flex flex-col gap-y-4 items-center justify-center">
      <Image
        src="/images/success.svg"
        alt="success"
        width={300}
        height={200}
        className="animate-scaleIn"
      />
      <div className="text-center">
        <p className="text-lg font-medium text-white">Woo-hoo, You Minted!</p>
        <p className="text-sm font-normal text-white text-center mt-1 w-[80%] mx-auto">
          This may take a few minutes to show up in your account.
        </p>
      </div>
    </div>
  );
};

export default MintSuccess;
