"use client";

import Banner from "@/components/Banner";
import Steps, { Step } from "@/components/Steps";
import Navbar from "@/components/ui/Navbar";
import { erc721Abi } from "@/utils/abis/erc721";
import { generatePrivate, getPublic } from "@toruslabs/eccrypto";
import { OpenloginSessionManager } from "@toruslabs/session-manager";
import { WalletProvider } from "@web3auth/global-accounts-sdk";
import { useEffect, useState } from "react";
import { encodeFunctionData } from "viem";

export default function Home() {
  const [walletProvider, setWalletProvider] = useState<WalletProvider>();
  const [loggedIn, setLoggedIn] = useState(walletProvider?.connected || false);
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [skipToStep, setSkipToStep] = useState("");

  // todo: change this before deployment or move it to env
  const [selectedEnv, setSelectedEnv] = useState("local");
  const [chainId, setChainId] = useState(80002)

  useEffect(() => {
    const getWalletURL = () => {
      if (selectedEnv === "local") {
        return "http://localhost:3000/connect";
      } else {
        return "https://lrc-accounts.web3auth.io/connect";
      }
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
          setSkipToStep("import");
        }
      } catch (err) {
        console.log(err);
        setAddress("");
      }
    };
    getAddress();
  }, [walletProvider?.connected, selectedEnv]);

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
      setSkipToStep("fundToken");
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
        to: "0x5493818C548020536F7aF02ea1905055aEBC3D7f",
        data,
        value: "0",
      },
    });

    console.log("mint nft resp", resp);
  }

  async function importAccount() {
    try {
      if(address) {
        const privateKeyBuf = generatePrivate();
        const publicKeyBuf = getPublic(privateKeyBuf);
  
        const privateKey = privateKeyBuf.toString("hex");
        const publicKey = publicKeyBuf.toString("hex");
        console.log({privateKey, publicKey});
  
        let sessionId = OpenloginSessionManager.generateRandomSessionKey();
        const sessionMgr = new OpenloginSessionManager({ sessionId });
        sessionId = await sessionMgr.createSession({
          privateKey, publicKey, keyType: "secp256k1"
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
    <main className="p-6">
      <Navbar
        address={address}
        handleConnect={loginOrRegister}
        loader={isLoading}
      />
      <Banner />
      {walletProvider ? (
        <Steps
          chainId={chainId}
          skipToStep={skipToStep as Step}
          address={address}
          loginOrRegister={loginOrRegister}
          walletProvider={walletProvider}
          handleMintNft={mintNft}
          handleImportAccount={importAccount}
        />
      ) : (
        <></>
      )}
    </main>
  );
}
