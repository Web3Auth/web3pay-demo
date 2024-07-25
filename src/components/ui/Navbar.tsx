import React from "react";
import Image from "next/image";
import Button from "./Button";

const Navbar = ({
  handleConnect,
  loader,
}: {
  handleConnect?: () => void;
  loader?: boolean;
}) => {
  return (
    <div className="flex items-center justify-between">
      <Image
        src="/images/web3auth-logo.svg"
        alt="Web3Auth Logo"
        height={50}
        width={50}
      />
      <Button
        title="Connect"
        loading={loader}
        handleClick={() => handleConnect && handleConnect()}
      />
    </div>
  );
};

export default Navbar;
