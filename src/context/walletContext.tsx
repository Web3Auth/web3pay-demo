"use client";

import { SelectedEnv } from "@/utils/interfaces";
import { calculateBaseUrl } from "@/utils/utils";
// WalletContext.js
import { WalletProvider } from "@web3auth/global-accounts-sdk";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

interface IWalletContext {
  address: string;
  setAddress: (val: string) => void;
  selectedEnv: SelectedEnv;
  setSelectedEnv: (val: SelectedEnv) => void;
  walletProvider: WalletProvider | null;
  setWalletProvider: (val: WalletProvider) => void;
  loggedIn: boolean;
  setLoggedIn: (val: boolean) => void;
  showNextLoginModal: boolean;
  setShowNextLoginModal: (val: boolean) => void;  
}

const WalletContext = createContext<IWalletContext>({
  address: "",
  selectedEnv: "production" as SelectedEnv,
  setSelectedEnv: (selectedEnv: SelectedEnv) => {},
  setAddress: (address: string) => {},
  walletProvider: null,
  setWalletProvider: (provider: WalletProvider) => {},
  loggedIn: false,
  setLoggedIn: (loggedIn: boolean) => {},
  showNextLoginModal: false,
  setShowNextLoginModal: (show: boolean) => {},
});

export const WalletProviderContext = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [selectedEnv, setSelectedEnv] = useState<SelectedEnv>("production");
  const [walletProvider, setWalletProvider] = useState<WalletProvider | null>(
    null
  );
  const [showNextLoginModal, setShowNextLoginModal] = useState<boolean>(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [chainId, setChainId] = useState(80002);

  useEffect(() => {
    const getWalletURL = () => {
      const url = new URL(window.location.href);
      const env: SelectedEnv = url.searchParams.get("env") as SelectedEnv || "production";
      setSelectedEnv(env);
      return `${calculateBaseUrl(env)}/connect`;
    };

    // initiate sdk
    const initWalletProvider = async () => {
      const _walletProvider = new WalletProvider({
        metadata: {
          appChainIds: [chainId],
          appName: "Web3Pay Demo",
          appLogoUrl: "https://demo-web3pay.tor.us/images/w3a-light.svg",
        },
        preference: {
          keysUrl: getWalletURL(),
        },
      });

      _walletProvider.addListener("disconnect", () => {
        setAddress("");
        setWalletProvider(null);
        localStorage.clear();
        setLoggedIn(false);
        setShowNextLoginModal(true);
      });

      setWalletProvider(_walletProvider);
      setLoggedIn(walletProvider?.connected || false);
    };
    initWalletProvider();
  }, [walletProvider?.connected, chainId]);

  useEffect(() => {
    // check if user is already logged in
    const getAddress = async () => {
      try {
        setLoggedIn(walletProvider?.connected || loggedIn);
        const account = (await walletProvider?.request({
          method: "eth_accounts",
          params: [],
        })) as string[];

        const url = new URL(window.location.href);
        if (account?.length) {
          setAddress(account[0]);
          router.push(`/home${url.search}`);
        } else {
          router.push(`/${url.search}`);
        }
      } catch (err) {
        console.log(err);
        setAddress("");
      }
    };
    getAddress();
  }, [loggedIn, router, walletProvider]);

  return (
    <WalletContext.Provider
      value={{
        selectedEnv,
        setSelectedEnv,
        address,
        setAddress,
        walletProvider,
        setWalletProvider,
        loggedIn,
        setLoggedIn,
        showNextLoginModal,
        setShowNextLoginModal,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  return useContext(WalletContext);
};
