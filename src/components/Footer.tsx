import React from "react";
import Image from "next/image";
import { openInNewTab } from "@/utils";
import { cn } from "@/utils/utils";

const Footer = ({ containerClass }: { containerClass?: string }) => {
  return (
    <footer className={cn("mb-20 px-10 sm:px-20", containerClass)}>
      <div className="h-0.5 w-full mx-auto bg-gradient-to-r from-primary via-gradient-three to-primary"></div>

      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between pt-6 sm:pt-16 max-sm:gap-y-4">
        <div className="flex flex-col items-center sm:items-start gap-y-2 text-center sm:text-left">
          <Image
            src="/images/footer-logo.svg"
            alt="Footer Logo"
            height={24}
            width={200}
          />
          <p className="text-base font-normal text-white sm:w-[60%]">
            This is a showcase of our Web3Pay product demo. Try it out, share
            your experience and tag us @Web3Auth
          </p>
        </div>
        <div className="flex flex-col gap-y-2 text-center sm:text-right w-max">
          <p className="text-[#1AC7FE] text-sm font-bold uppercase w-max">
            FOLLOW US
          </p>
          <div className="flex items-center justify-between gap-x-4 cursor-pointer">
            <Image
              onClick={() => openInNewTab("https://x.com/Web3Auth")}
              src={"/icons/x-light.svg"}
              alt="x"
              height={30}
              width={30}
            />
            <Image
              onClick={() => openInNewTab("https://warpcast.com/web3auth")}
              src={"/icons/farcaster.svg"}
              alt="x"
              height={30}
              width={30}
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
