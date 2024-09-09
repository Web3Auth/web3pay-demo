"use client";

import { SelectedEnv } from "@/utils/interfaces";
import { calculateBaseUrl } from "@/utils/utils";
// WalletContext.js
import { WalletProvider } from "@web3auth/global-accounts-sdk";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

const WalletContext = createContext({
  address: "",
  selectedEnv: "production" as SelectedEnv,
  setSelectedEnv: (selectedEnv: SelectedEnv) => {},
  setAddress: (address: string) => {},
  walletProvider: null as any,
  setWalletProvider: (provider: any) => {},
  loggedIn: false,
  setLoggedIn: (loggedIn: boolean) => {},
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
          let searchParams = url.search || "&showLogin=true";
          if (!searchParams.startsWith("?")) {
            searchParams = "?showLogin=true"
          }

          router.push(`/${searchParams}`);
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
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  return useContext(WalletContext);
};
