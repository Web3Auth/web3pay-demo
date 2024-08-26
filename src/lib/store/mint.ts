import { IRandomWallet } from "@/utils/interfaces";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const STEPS = {
    CONNECT: "Connect",
    CROSS_CHAIN_MINTING: "Cross_Chain_Minting",
    VIEW_SUMMARY: "View_Summary",
  };
interface MintState {
    testWalletInfo: IRandomWallet,
    isTestWalletConnected: boolean;
    activeStep: string;
    setActiveStep: (step: string) => void;
    setTestWalletInfo: (walletInfo: IRandomWallet) => void;
    setTestWalletConnected: (isConnected: boolean) => void;
    resetMintState: () => void;
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
        })),
    }),
    {
      name: "mint-storage",
      skipHydration: false,
    },
  ),
);

export default useMintStore;
