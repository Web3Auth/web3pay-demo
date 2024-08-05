"use client";

import { SelectedEnv } from '@/utils/interfaces';
import { calculateBaseUrl } from '@/utils/utils';
// WalletContext.js
import { WalletProvider } from '@web3auth/global-accounts-sdk';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState } from 'react';

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

export const WalletProviderContext = ({ children }: { children: React.ReactNode }) => {
  const [address, setAddress] = useState("");
  const [selectedEnv, setSelectedEnv] = useState<SelectedEnv>("production");
  const [walletProvider, setWalletProvider] = useState<WalletProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [chainId, setChainId] = useState(80002);
  const router = useRouter();

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
            appName: "Demo App",
            appLogoUrl: "https://web3auth.io/images/web3authlog.png",
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
          router.push("/home");
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
