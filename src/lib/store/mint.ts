import { IRandomWallet } from "@/utils/interfaces";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const STEPS = {
    CONNECT: "Connect",
    CROSS_CHAIN_MINTING: "Cross_Chain_Minting",
    VIEW_SUMMARY: "View_Summary",
  };

  export const MINT_STEPS = {
    START: "start",
    MINTING: "minting",
    WAITING: "waiting",
    SUCCESS: "success",
    FAILED: "failed",
  };


export interface MintNftState {
    mintStep: string
    mintError: string;
    userOpHashUrl: string;
    txHashUrl: string;
}
interface MintState {
    mintNftState: MintNftState;
    testWalletInfo: IRandomWallet,
    isTestWalletConnected: boolean;
    activeStep: string;
    setMintNftState: (state: MintNftState) => void;
    setActiveStep: (step: string) => void;
    setTestWalletInfo: (walletInfo: IRandomWallet) => void;
    setTestWalletConnected: (isConnected: boolean) => void;
    resetMintState: () => void;
    resetMintNftState: () => void;
}

const useMintStore = create<MintState>()(
  persist(
    (set) => ({
        activeStep: STEPS.CONNECT,
        testWalletInfo: {
            publicKey: "",
            privateKey: "",
            address: "",
            keyType: "secp256k1",
        },
        mintNftState: {
            mintStep: MINT_STEPS.START,
            mintError: "",
            userOpHashUrl: "",
            txHashUrl: "",
        },
        resetMintNftState: () => set((state) => ({ mintNftState: {  
            mintStep: MINT_STEPS.START,
            mintError: "",
            userOpHashUrl: "",
            txHashUrl: "",
        } })),

        setMintNftState: (nftState: MintNftState) => set((state) => ({ mintNftState: { ...nftState } })),
        isTestWalletConnected: false,
        setActiveStep: (step: string) => set((state) => ({ activeStep: step })),
        setTestWalletInfo: (walletInfo: IRandomWallet) => set((state) => ({ testWalletInfo: { ...walletInfo } })),
        setTestWalletConnected: (isConnected: boolean) => set((state) => ({ isTestWalletConnected: isConnected })),
        resetMintState: () => set((state) => ({
            testWalletInfo: {
                publicKey: "",
                privateKey: "",
                address: "",
                keyType: "secp256k1",
            },
            isTestWalletConnected: false,
            activeStep: STEPS.CONNECT,
            mintNftState: {
                mintStep: MINT_STEPS.START,
                mintError: "",
                userOpHashUrl: "",
                txHashUrl: "",
            },
        })),
    }),
    {
      name: "mint-storage",
      skipHydration: false,
    },
  ),
);

export default useMintStore;
