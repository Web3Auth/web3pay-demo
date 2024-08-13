import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Button from "./Button";
import { copyToClipBoard, openInNewTab, sliceAddress } from "@/utils";
import { TbCopy, TbCircleCheck, TbLogout, TbWallet } from "react-icons/tb";
import Link from "next/link";
import { useWallet } from "@/context/walletContext";

const Navbar = ({
  address,
  loader,
  showButton = true,
}: {
  address: string;
  loader?: boolean;
  showButton?: boolean;
}) => {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const { setAddress, setLoggedIn, setWalletProvider } = useWallet();

  const handleCopy = () => {
    setCopied(true);
    copyToClipBoard(address || "");
    setTimeout(() => {
      setCopied(false);
      setShowMenu(false);
    }, 2000);
  };

  const handleLogout = () => {
    setShowMenu(false);
    setAddress("");
    setWalletProvider(null);
    localStorage.clear();
    setLoggedIn(false);
  };

  const handleAddressExplorer = () => {
    openInNewTab(`https://sepolia.arbiscan.io/address/${address}`);
  };

  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleOutsideClick = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setShowMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div className="flex items-center justify-between fixed top-0 p-5 backdrop-blur-3xl gap-y-3 bg-[#050b32] w-full z-50">
      <Image
        src="/images/web3auth-logo.svg"
        alt="Web3Auth Logo"
        height={40}
        width={40}
      />
      {showButton ? (
        <div className="relative" ref={dropdownRef}>
          <Button
            title={sliceAddress(address)}
            loading={loader}
            handleClick={() => setShowMenu((prev) => !prev)}
            otherClasses={copied ? "text-green-400" : ""}
          />
          <div
            className={`bg-navDropdown mt-2 rounded-lg w-[220px] origin-top-right absolute right-1 z-40 transition-transform duration-500 ease-in-out transform ${
              showMenu
                ? "translate-y-0 opacity-100"
                : "-translate-y-1 opacity-0 pointer-events-none"
            }`}
          >
            <button
              className="appearance-none flex items-center gap-x-2 px-4 py-3 border-b border-gray-700 w-full"
              onClick={handleCopy}
            >
              {copied ? (
                <TbCircleCheck className="text-green-400 text-xl" />
              ) : (
                <TbCopy className="text-white text-xl" />
              )}
              <p className="text-white text-sm font-normal">
                {copied ? "Copied address" : "Copy address"}
              </p>
            </button>
            <button
              className="appearance-none flex items-center gap-x-2 px-4 py-3 border-b border-gray-700 w-full"
              onClick={handleAddressExplorer}
            >
              <TbWallet className="text-white text-xl" />
              <p className="text-white text-sm font-normal">
                View account details
              </p>
            </button>
            <button
              className="appearance-none flex items-center gap-x-2 px-4 py-3 w-full"
              onClick={handleLogout}
            >
              <TbLogout className="text-red-400 text-xl" />
              <p className="text-red-400 text-sm font-normal">Log out</p>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Navbar;
