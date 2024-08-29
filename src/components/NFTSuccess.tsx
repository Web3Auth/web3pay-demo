import { S3_ASSETS_URL } from "@/utils/utils";
import Image from "next/image";
import React from "react";

const NFTSuccess = () => {
  return (
    <div className="w-full flex flex-col gap-y-4 items-center justify-center">
      <Image
        src={`${S3_ASSETS_URL}/images/erc721.png`}
        alt="success"
        width={300}
        height={200}
        className="animate-scaleIn"
      />
      <div className="text-center">
        <p className="text-lg font-medium text-white">Web3Auth NFT Minted!</p>
        <p className="text-sm font-normal text-white text-center mt-1 w-[80%] mx-auto">
          Check out the new collectible details in your account
        </p>
      </div>
    </div>
  );
};

export default NFTSuccess;
