/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Image from "next/image";

import Navbar from "@/components/ui/Navbar";
import { erc721Abi } from "@/utils/abis/erc721";
import { IRandomWallet, SelectedEnv } from "@/utils/interfaces";
import { OpenloginSessionManager } from "@toruslabs/session-manager";
import { useEffect, useState } from "react";
import { encodeFunctionData, Hex } from "viem";
import { calculateBaseUrl, nftContractAddress } from "@/utils/utils";
import { useWallet } from "@/context/walletContext";

import { createClient, http } from "viem";
import { polygonAmoy } from "viem/chains";
import { bundlerActions, ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import Home from "@/components/Home";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  // todo: change this before deployment or move it to env
  const { address } = useWallet();

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 4000);
  }, []);

  return (
    <main className="flex flex-col">
      <>
        {isLoading ? (
          <>
            <Navbar
              address={address}
              containerClass="bg-transparent"
              showButton={false}
            />
            <section className="h-[calc(100dvh_-_70px)] flex-grow px-6 py-10 md:p-9 flex flex-col items-center justify-center relative z-1 max-md:gap-y-10 mt-8">
              <Image
                src={"/images/cross-chain-gradient.png"}
                alt="cross chain"
                width={400}
                height={400}
                className="z-0 w-full h-full opacity-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              />
              <div className="flex flex-col text-center gap-y-6 mt-10 md:mt-5 w-full">
                <div className="text-center text-3xl sm:text-5xl lg:banner-heading-text flex flex-col gap-y-1">
                  <div className="flex flex-col md:flex-row items-center gap-x-2 justify-center">
                    <p>Experience</p>
                    <div className="content">
                      <div className="content__container !px-0 text-center">
                        <ul className="content__container__list gradient-text text-3xl sm:text-5xl lg:banner-heading-text max-md:!text-center">
                          <li className="content__container__list__item">
                            Wallet{" "}
                            <span className="gradient-tex">Abstraction</span>
                          </li>
                          <li className="content__container__list__item">
                            Liquidity{" "}
                            <span className="gradient-tex">Abstraction</span>
                          </li>
                          <li className="content__container__list__item">
                            Chain{" "}
                            <span className="gradient-tex">Abstraction</span>
                          </li>
                          <li className="content__container__list__item">
                            Wallet{" "}
                            <span className="gradient-tex">Abstraction</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <p>All-in-One</p>
                </div>
              </div>
            </section>
          </>
        ) : (
          <>
            <Home address={address} />
          </>
        )}
      </>
    </main>
  );
}
