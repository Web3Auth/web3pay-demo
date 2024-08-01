import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Button from "./Button";
import { copyToClipBoard, sliceAddress } from "@/utils";
import { TbCopy, TbCircleCheck, TbLogout } from "react-icons/tb";
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
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    copyToClipBoard(address || "");
    setShowMenu(false);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleLogout = () => {
    setShowMenu(false);
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
        <div className="relative" ref={dropdownRef}>
          <Button
            title={sliceAddress(address)}
            loading={loader}
            handleClick={() => setShowMenu((prev) => !prev)}
            otherClasses={copied ? "text-green-400" : ""}
          />
          <div
            className={`bg-navDropdown mt-2 rounded-lg w-full origin-top-right absolute left-0 z-40 transition-transform duration-500 ease-in-out transform ${
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
                <TbCircleCheck className="text-white text-xl" />
              ) : (
                <TbCopy className="text-white text-xl" />
              )}
              <p className="text-white text-sm font-normal">Copy address</p>
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
