import React from "react";
import Image from "next/image";
import Button from "./Button";
import { copyToClipBoard, sliceAddress } from "@/utils";
import { TbCopy, TbCircleCheck } from "react-icons/tb";
import Link from "next/link";

const Navbar = ({
  address,
  loader,
  showButton = true,
}: {
  address: string;
  loader?: boolean;
  showButton?: boolean;
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    setCopied(true);
    copyToClipBoard(address || "");
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="flex items-center justify-between">
      <Link href="/">
        <Image
          src="/images/web3auth-logo.svg"
          alt="Web3Auth Logo"
          height={50}
          width={50}
        />
      </Link>
      {showButton ? (
       
          <Button
            title={copied ? "Copied!" : sliceAddress(address)}
            loading={loader}
            icon={
              copied ? (
                <TbCircleCheck className="text-white text-xl" />
              ) : (
                <TbCopy className="text-white text-xl" />
              )
            }
            handleClick={handleCopy}
          />
      ) : null}
    </div>
  );
};

export default Navbar;
