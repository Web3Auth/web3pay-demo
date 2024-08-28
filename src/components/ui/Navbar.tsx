import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Button from "./Button";
import { copyToClipBoard, openInNewTab, sliceAddress } from "@/utils";
import { TbCopy, TbCircleCheck, TbLogout, TbWallet } from "react-icons/tb";
import { useWallet } from "@/context/walletContext";
import { cn } from "@/utils/utils";
import useMintStore from "@/lib/store/mint";
import { useRouter } from "next/navigation";

const Navbar = ({
  address,
  loader,
  showButton = true,
  containerClass,
  logoText,
  redirectRoute,
}: {
  address: string;
  loader?: boolean;
  showButton?: boolean;
  containerClass?: string;
  logoText?: string;
  redirectRoute?: string;
}) => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const { resetMintState } = useMintStore()
  const { setAddress, setLoggedIn, setWalletProvider, walletProvider } = useWallet();

  const handleCopy = () => {
    setCopied(true);
    copyToClipBoard(address || "");
    setTimeout(() => {
      setCopied(false);
      setShowMenu(false);
    }, 2000);
  };

  const handleLogout = async () => {
    const logoutResp = await walletProvider?.request({
      method: "wallet_disconnect",
    });
    console.log("logoutResp", logoutResp);
    resetMintState();
    setShowMenu(false);
    setAddress("");
    setWalletProvider(null);
    localStorage.clear();
    setLoggedIn(false);
  };

  const handleAddressExplorer = () => {
    openInNewTab(`https://amoy.polygonscan.com/address/${address}`);
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
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousedown", handleOutsideClick);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div
      className={cn(
        "flex items-center justify-between fixed top-0 p-5 gap-y-3 w-full z-50",
        `${
          scrollPosition > 20
            ? "navbar-glass-effect"
            : containerClass ?? "bg-navBar"
        }`
      )}
    >
      <div onClick={() => {
        redirectRoute && router.push(redirectRoute) ;
      }} className={`${redirectRoute ? "cursor-pointer": "cursor-default"} flex items-center gap-x-6`}
      >
        <Image
          src="/images/web3auth-logo.svg"
          alt="Web3Auth Logo"
          height={40}
          width={40}
        />
        {logoText && (
          <p className="text-2xl font-normal text-white hidden md:block hover:underline">
            {logoText}
          </p>
        )}
      </div>
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
