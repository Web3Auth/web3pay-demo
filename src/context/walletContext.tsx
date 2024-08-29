"use client";

import { SelectedEnv } from "@/utils/interfaces";
import { calculateBaseUrl } from "@/utils/utils";
// WalletContext.js
import { WalletProvider } from "@web3auth/global-accounts-sdk";
import { usePathname, useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

type TWalletContext = {
  address: string;
  setAddress: (v: string) => void;
  selectedEnv: SelectedEnv;
  setSelectedEnv: (v: SelectedEnv) => void;
  walletProvider: WalletProvider | null;
  setWalletProvider: (v: WalletProvider) => void;
  loggedIn: boolean;
  setLoggedIn: (v: boolean) => void;
}

const WalletContext = createContext<TWalletContext>({
  address: "",
  selectedEnv: "production" as SelectedEnv,
  setSelectedEnv: (selectedEnv: SelectedEnv) => {},
  setAddress: (address: string) => {},
  walletProvider: null,
  setWalletProvider: (provider: WalletProvider) => {},
  loggedIn: false,
  setLoggedIn: (loggedIn: boolean) => {},
});

export const WalletProviderContext = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [address, setAddress] = useState("");
  const [selectedEnv, setSelectedEnv] = useState<SelectedEnv>("production");
  const [walletProvider, setWalletProvider] = useState<WalletProvider | null>(
    null
  );
  const [loggedIn, setLoggedIn] = useState(false);
  const [chainId, setChainId] = useState(80002);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const getWalletURL = () => {
      return `${calculateBaseUrl(selectedEnv)}/connect`;
    };

    // initiate sdk
    const initWalletProvider = async () => {
      setWalletProvider(
        new WalletProvider({
          metadata: {
            appChainIds: [chainId],
            appName: "Web3Pay Demo",
            appLogoUrl: "https://demo-web3pay.tor.us/images/w3a-light.svg",
          },
          preference: {
            keysUrl: getWalletURL(),
          },
        })
      );
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
          pathname === "/" ? router.push("/home") : router.push(pathname);
        } else {
          router.push("/");
        }
      } catch (err) {
        console.log(err);
        setAddress("");
      }
    };
    getAddress();
  }, [walletProvider?.connected, selectedEnv]);

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
