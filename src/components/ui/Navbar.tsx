import React from "react";
import Image from "next/image";
import Button from "./Button";

const Navbar = ({
  handleConnect,
  loader,
  address,
}: {
  handleConnect?: () => void;
  loader?: boolean;
  address: string;
}) => {
  return (
    <div className="flex items-center justify-between">
      <Image
        src="/images/web3auth-logo.svg"
        alt="Web3Auth Logo"
        height={50}
        width={50}
      />
      {
        !address ? (
          <Button
            title="Connect"
            loading={loader}
            handleClick={() => handleConnect && handleConnect()}
          />
        ) : (
          <Button
            title={address}
            loading={loader}
          />
        )
      }
    </div>
  );
};

export default Navbar;
