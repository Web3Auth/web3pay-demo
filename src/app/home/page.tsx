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
import { WalletProvider } from "@web3auth/global-accounts-sdk";
import { useEffect, useState } from "react";
import { HiOutlineArrowSmRight } from "react-icons/hi";
import { encodeFunctionData } from "viem";
import { calculateBaseUrl } from "@/utils/utils";
import MintSuccess from "@/components/MintSuccess";
import NFTSuccess from "@/components/NFTSuccess";

export default function Home() {
  const [walletProvider, setWalletProvider] = useState<WalletProvider>();
  const [loggedIn, setLoggedIn] = useState(walletProvider?.connected || false);
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [skipToStep, setSkipToStep] = useState("");
  const [mintSuccess, setMintSuccess] = useState(true);
  const [nftSuccess, setNftSuccess] = useState(false);

  // todo: change this before deployment or move it to env
  const [selectedEnv, setSelectedEnv] = useState<SelectedEnv>("local");
  const [chainId, setChainId] = useState(80002);

  useEffect(() => {
    const getWalletURL = () => {
      return `${calculateBaseUrl(selectedEnv)}/connect`;
    };

    // initiate sdk
    const initWalletProvider = async () => {
      setIsLoading(true);
      setWalletProvider(
        new WalletProvider({
          metadata: {
            appChainIds: [chainId],
            appName: "Demo App",
            appLogoUrl: "https://web3auth.io/images/web3authlog.png",
          },
          preference: {
            keysUrl: getWalletURL(),
          },
        })
      );
      setIsLoading(false);
      setLoggedIn(walletProvider?.connected || false);
    };
    initWalletProvider();

    // check if user is already logged in
    const getAddress = async () => {
      try {
        setLoggedIn(walletProvider?.connected || loggedIn);
        const account = (await walletProvider?.request({
          method: "eth_accounts",
          params: [],
        })) as string[];
        if (account?.length) {
          setAddress(account[0]);
        }
      } catch (err) {
        console.log(err);
        setAddress("");
      }
    };
    getAddress();
  }, [walletProvider?.connected, selectedEnv]);

  // step 0 (connect)
  async function loginOrRegister() {
    setIsLoading(true);
    try {
      const response = await walletProvider?.request({
        method: "eth_requestAccounts",
        params: [],
      });
      const loggedInAddress = (response as string[])[0];
      setAddress(loggedInAddress);
      setLoggedIn(walletProvider?.connected || false);
      // addLog(`Success full login: ${response}`);
    } catch (err) {
      console.log(`Error during login: ${JSON.stringify(err)}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function mintNft(address: string) {
    const data = encodeFunctionData({
      abi: erc721Abi,
      functionName: "mint",
      args: [address],
    });

    const resp = await walletProvider?.request({
      method: "eth_sendTransaction",
      params: {
        from: address,
        to: "0xFD8e3E880a098F2aCC1F855974e4Ce03Ef4B147F",
        data,
        value: "0",
      },
    });

    console.log("mint nft resp", resp);
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
    }
  }

  return (
    <main className="flex flex-col">
      <section className="flex-grow px-6 py-10 md:p-9 flex flex-col max-md:gap-y-10">
        <Navbar
          address={address}
          handleConnect={loginOrRegister}
          loader={isLoading}
        />
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
          />
        </div>
      </section>
      <Modal isOpen={mintSuccess} onClose={() => setMintSuccess(false)}>
        <MintSuccess />
      </Modal>
      <Modal isOpen={nftSuccess} onClose={() => setNftSuccess(false)}>
        <NFTSuccess />
      </Modal>
    </main>
  );
}
