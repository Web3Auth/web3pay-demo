/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import ImportFlow from "@/components/ImportFlow";
import NonImportFlow from "@/components/NonImportFlow";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";

import Navbar from "@/components/ui/Navbar";
import { erc721Abi } from "@/utils/abis/erc721";
import { IRandomWallet, SelectedEnv } from "@/utils/interfaces";
import { OpenloginSessionManager } from "@toruslabs/session-manager";
import { useState } from "react";
import { encodeFunctionData, Hex } from "viem";
import { calculateBaseUrl } from "@/utils/utils";
import MintSuccess from "@/components/MintSuccess";
import { useWallet } from "@/context/walletContext";

import { createClient, http } from "viem";
import { polygonAmoy } from "viem/chains";
import { bundlerActions, ENTRYPOINT_ADDRESS_V07 } from "permissionless";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [nftSuccess, setNftSuccess] = useState(false);
  // todo: change this before deployment or move it to env
  const [selectedEnv, setSelectedEnv] = useState<SelectedEnv>("local");

  const { walletProvider, address } = useWallet();

  const [mintNftState, setMintNftState] = useState({
    minting: false,
    mintSuccess: false,
    mintError: "",
    mintRedirectUrl: "",
  });

  async function mintNft(address: string) {
    try {
      const data = encodeFunctionData({
        abi: erc721Abi,
        functionName: "mint",
        args: [address],
      });

      const resp = await walletProvider?.request({
        method: "eth_sendTransaction",
        params: {
          from: address,
          to: "0xd774B6e1880dC36A3E9787Ea514CBFC275d2ba61",
          data,
          value: "0",
        },
      });
      if (resp) {
        // setMintSuccess(true);
        setMintNftState({
          mintError: "",
          minting: true,
          mintSuccess: false,
          mintRedirectUrl: `https://jiffyscan.xyz/userOpHash/${resp}`,
        });
        waitForMinting(resp);
      }
      return `${calculateBaseUrl(
        selectedEnv
      )}/wallet/nft/0xd774B6e1880dC36A3E9787Ea514CBFC275d2ba61`;
    } catch (e: unknown) {
      console.error("error minting nft", e);
      throw e;
    } finally {
    }
  }

  async function waitForMinting(hash: Hex) {
    const bundlerClient = createClient({
      chain: polygonAmoy,
      transport: http(
        "https://rpc.zerodev.app/api/v2/bundler/779a8e75-8332-4e4f-b6e5-acfec9f777d9"
      ),
    }).extend(bundlerActions(ENTRYPOINT_ADDRESS_V07));
    
    // wait for user op hash to be completed
    const userOperationByHash = await bundlerClient.waitForUserOperationReceipt({
      hash,
    });
    if (userOperationByHash.receipt) {
      setMintNftState({
        mintError: "",
        minting: false,
        mintSuccess: true,
        mintRedirectUrl: `${calculateBaseUrl(
          selectedEnv
        )}/wallet/nft/0xd774B6e1880dC36A3E9787Ea514CBFC275d2ba61`,
      });
      setNftSuccess(true);
    }
  }

  async function importAccount(randWallet: IRandomWallet) {
    try {
      if (address) {
        const { privateKey, publicKey, keyType } = randWallet;
        let sessionId = OpenloginSessionManager.generateRandomSessionKey();
        const sessionMgr = new OpenloginSessionManager({ sessionId });
        sessionId = await sessionMgr.createSession({
          privateKey,
          publicKey,
          keyType,
        });

        const response = await walletProvider?.request({
          method: "wallet_importW3aSession",
          params: {
            sessionId,
          },
        });
        console.log("Response", response);
      }
    } catch (e: unknown) {
      console.error("error importing account", e);
      throw e;
    }
  }

  return (
    <main className="flex flex-col">
      <section className="flex-grow px-6 py-10 md:p-9 flex flex-col max-md:gap-y-10">
        <Navbar address={address} loader={isLoading} />
        <div className="flex flex-col text-center gap-y-6 mt-10 md:mt-5 w-full">
          <div className="text-center text-3xl sm:banner-heading-text flex flex-col gap-y-1">
            <div className="flex flex-col md:flex-row items-center gap-x-2 justify-center">
              <p>Experience</p>
              <div className="content">
                <div className="content__container !px-0 text-center">
                  <ul className="content__container__list gradient-text text-3xl sm:banner-heading-text max-md:!text-center">
                    <li className="content__container__list__item">
                      Wallet <span className="gradient-tex">Abstraction</span>
                    </li>
                    <li className="content__container__list__item">
                      Liquidity{" "}
                      <span className="gradient-tex">Abstraction</span>
                    </li>
                    <li className="content__container__list__item">
                      Chain <span className="gradient-tex">Abstraction</span>
                    </li>
                    <li className="content__container__list__item">
                      Wallet <span className="gradient-tex">Abstraction</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <p>All-in-One</p>
          </div>
        </div>
        <Image
          src="/images/demo-home-bg.svg"
          alt="bg"
          height={100}
          width={580}
          className="mx-auto shadow-2xl rounded-3xl opacity-80 w-full lg:w-[62%]  xl:w-[50%] 2xl:w-[60%] md:-mt-24 lg:-mt-28"
        />
      </section>
      <section className="flex-grow relative z-1 bg-darkCard py-11 px-9 pb-20 w-full">
        <Image
          src={"/images/cross-chain-gradient.png"}
          alt="cross chain"
          width={400}
          height={400}
          className="z-0 w-full h-full opacity-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
        <div className="flex flex-col items-center justify-center text-center">
          <Button title="Demo"></Button>
          <NonImportFlow
            mintState={mintNftState}
            handleMintNft={mintNft}
            address={address}
            selectedEnv={selectedEnv}
          />
        </div>
      </section>
      <section className="flex-grow p-10 md:py-24 md:px-20 text-center w-full">
        <p className="gradient-text text-3xl md:text-5xl font-bold md:w-[80%]">
          Keeping track of multiple chains can be overwhelming. Let us make it
          easier for you.
        </p>
      </section>

      <section className="flex-grow relative z-1 bg-darkCard py-11 px-9 pb-20">
        <Image
          src={"/images/cross-chain-gradient.png"}
          alt="cross chain"
          width={400}
          height={400}
          className="z-0 w-full h-full opacity-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
        <div className="flex flex-col items-center justify-center text-center w-full">
          <Button title="Demo"></Button>
          <ImportFlow
            handleImportAccount={importAccount}
            handleMintNft={mintNft}
            selectedEnv={selectedEnv}
            mintState={mintNftState}
          />
        </div>
      </section>
      <Modal isOpen={mintSuccess} onClose={() => setMintSuccess(false)}>
        <MintSuccess />
      </Modal>
    </main>
  );
}
