import { useWallet } from "@/context/walletContext";
import { sliceAddress, openInNewTab } from "@/utils";
import {
  IRandomWallet,
  ConnectWeb3PayStep,
  TRandomWalletKeyType,
} from "@/utils/interfaces";
import { calculateBaseUrl, cn, parseSdkError } from "@/utils/utils";
import { generatePrivate, getPublic } from "@toruslabs/eccrypto";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPublicClient, Hex, http } from "viem";
import { privateKeyToAddress } from "viem/accounts";
import ImportFlowCard from "./ui/ImportFlowCard";
import ErrorPopup from "./ErrorPopup";
import { Modal } from "./ui/Modal";
import axios from "axios";
import { waitForTransactionReceipt } from "viem/actions";
import { arbitrumSepolia } from "viem/chains";
import { OpenloginSessionManager } from "@toruslabs/session-manager";
import useMintStore, { STEPS } from "@/lib/store/mint";

const ConnectStep = ({
  onSuccess,
  existingWallet,
}: {
  onSuccess: (randomWallet: IRandomWallet) => void;
  existingWallet: undefined | IRandomWallet;
}) => {
  const {
    activeStep,
    isTestWalletConnected,
    testWalletInfo,
    setTestWalletConnected,
    setTestWalletInfo,
  } = useMintStore();
  const { walletProvider, address: web3PayAddress, selectedEnv } = useWallet();
  const [completedSteps, setCompletedSteps] = useState<ConnectWeb3PayStep[]>(
    []
  );
  const [displayErrorPopup, setDisplayErrorPopup] = useState(false);
  const [errorStep, setErrorStep] = useState<string | undefined>();
  const [errorText, setErrorText] = useState("");
  const [subErrorText, setSubErrorText] = useState("");
  const [currentStep, setCurrentStep] = useState<ConnectWeb3PayStep>("start");
  const [stepLoader, setStepLoader] = useState(false);

  useEffect(() => {
    if (activeStep === STEPS.VIEW_SUMMARY) {
      setTestWalletInfo(testWalletInfo);
      setCurrentStep("completed");
      setCompletedSteps(["start", "connect"]);
      return;
    }
    if (testWalletInfo.address) {
      setTestWalletInfo(testWalletInfo);
      setCompletedSteps(["start"]);
      setCurrentStep("connect");
    } else {
      setCompletedSteps([]);
      setCurrentStep("start");
    }
    if (isTestWalletConnected) {
      setCompletedSteps(["start", "connect"]);
      onSuccess(testWalletInfo);
      setTestWalletConnected(true);
    }
  }, [activeStep]);

  const handleStep = async (step: ConnectWeb3PayStep) => {
    switch (step) {
      case "start":
        await handleCreateAndFundRandomWallet();
        break;
      case "connect":
        await importAccount(testWalletInfo as IRandomWallet);
        break;
      default:
        break;
    }
  };
  async function handleCreateAndFundRandomWallet() {
    try {
      setStepLoader(true);
      const privateKeyBuf = generatePrivate();
      const publicKeyBuf = getPublic(privateKeyBuf);

      const privateKey = privateKeyBuf.toString("hex");
      const publicKey = publicKeyBuf.toString("hex");

      const address = privateKeyToAddress(
        privateKey.startsWith("0x") ? (privateKey as Hex) : `0x${privateKey}`
      );
      await fundAccount(address);
      const newWallet = {
        publicKey,
        privateKey,
        address,
        keyType: "secp256k1" as TRandomWalletKeyType,
      };
      setCompletedSteps([...completedSteps, "start"]);
      setCurrentStep("connect");
      setTestWalletInfo(newWallet);
    } catch (err: any) {
      const parsedError = parseSdkError(
        err,
        "Error while creating or funding wallet"
      );
      setErrorStep("connect");
      setDisplayErrorPopup(true);
      console.error("error while creating random wallet", err);
      setErrorText(parsedError.errorText);
      setSubErrorText(parsedError.subErrorText);
    } finally {
      setStepLoader(false);
    }
  }

  async function fundAccount(address: string) {
    try {
      setStepLoader(true);
      const baseUrl = calculateBaseUrl(selectedEnv);

      const resp = await axios.post(`${baseUrl}/api/mint`, {
        chainId: "421614",
        toAddress: address,
      });
      const { txHash: hash, message } = resp.data;
      // setTxHash(hash);
      const publicClient = createPublicClient({
        chain: arbitrumSepolia,
        transport: http(
          "https://arbitrum-sepolia.infura.io/v3/dee726a2930e4573a743a5c8f79942c1"
        ),
      });
      if (hash) {
        await waitForTransactionReceipt(publicClient, {
          hash,
        });
      } else {
        throw new Error("Failed to fund test wallet");
      }
    } catch (error: unknown) {
      const parsedError = parseSdkError(error, "Error while Funding Wallet");
      setErrorText(parsedError.errorText);
      setSubErrorText(parsedError.subErrorText);
      // check if user has enough balance and proceed to next step
    } finally {
      setStepLoader(false);
    }
  }

  async function importAccount(randWallet?: IRandomWallet) {
    try {
      if (!randWallet) {
        throw new Error("Please generate a wallet first!");
      }

      setStepLoader(true);
      if (web3PayAddress) {
        const { privateKey, publicKey, keyType } = randWallet;
        let sessionId = OpenloginSessionManager.generateRandomSessionKey();
        const sessionMgr = new OpenloginSessionManager({ sessionId });
        sessionId = await sessionMgr.createSession({
          privateKey,
          publicKey,
          keyType,
          displayName: "Test Wallet",
        });

        const response = await walletProvider?.importExternalWallet(sessionId);
        console.log("Response", response);
        setCompletedSteps([...completedSteps, "connect"]);

        testWalletInfo && onSuccess(testWalletInfo);
        setTestWalletConnected(true);
      }
    } catch (e: unknown) {
      console.error("error importing account", e);
      const parsedError = parseSdkError(e, "Error while connecting account");
      setErrorStep("import");
      setDisplayErrorPopup(true);
      setErrorText(parsedError.errorText);
      setSubErrorText(parsedError.subErrorText);
    } finally {
      setStepLoader(false);
    }
  }

  async function onRetry() {
    setDisplayErrorPopup(false);
    if (errorStep === "connect") {
      await handleCreateAndFundRandomWallet();
    } else if (errorStep === "import") {
      await importAccount(testWalletInfo);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {activeStep !== STEPS.VIEW_SUMMARY && (
        <>
          <p className="text-3xl md:text-4xl font-bold text-center">
            Connecting with Web3Pay
          </p>
          <p className="text-xl md:text-2xl font-normal mt-2 w-full md:w-[60%] text-center">
            For demo purposes, a test funded wallet will be used instead of your
            external EOA wallets.
          </p>
        </>
      )}
      <div
        className={cn(
          "mt-16 w-full flex items-center flex-col sm:flex-row justify-center lg:w-[80%] 2xl:w-[65%]",
          { "mt-0": activeStep === STEPS.VIEW_SUMMARY }
        )}
      >
        <ImportFlowCard
          title="Create your funded wallet on Arbitrum"
          description="Get a funded test wallet for the demo that will stand in for your external wallets."
          step="1"
          isCompleted={completedSteps.includes("start")}
          isCurrent={currentStep === "start"}
          logo="arbitrum"
          resultOpacity
          resultText={sliceAddress(testWalletInfo?.address || "")}
          resultLogo="arbitrum"
          handleClick={() => handleStep("start")}
          btnText="Create test wallet"
          loading={stepLoader}
          handleCompletedLink={() =>
            openInNewTab(
              `https://sepolia.arbiscan.io/address/${testWalletInfo?.address}`
            )
          }
          gradientBtnClass="!w-[234px]"
        />
        <div className="h-[50px]">
          <Image
            src="/icons/arrow-right.svg"
            alt="arrow"
            height={50}
            width={50}
            className="rotate-90 my-5 mx-auto block sm:hidden"
          />
        </div>
        <div className="w-[200px]">
          <Image
            src="/icons/arrow-white.svg"
            alt="arrow"
            height={120}
            width={100}
            className="hidden sm:block"
          />
        </div>
        <ImportFlowCard
          title="Connect your wallet to Web3Pay Account"
          description="Allow your Web3Pay Account to access liquidity from your test wallet."
          step="2"
          isCompleted={completedSteps.includes("connect")}
          isCurrent={currentStep === "connect"}
          logo="arbitrum"
          resultOpacity
          resultText={"Wallet linked Successfully"}
          resultLogo="link-gradient"
          handleClick={() => handleStep("connect")}
          btnText="Connect Test Wallet"
          loading={stepLoader}
          handleCompletedLink={() =>
            openInNewTab(
              `https://sepolia.arbiscan.io/address/${testWalletInfo?.address}`
            )
          }
          gradientBtnClass="!w-[248px]"
        />
      </div>
      <Modal
        isOpen={displayErrorPopup}
        onClose={() => setDisplayErrorPopup(false)}
      >
        <ErrorPopup
          handleTryAgain={onRetry}
          subText={subErrorText}
          text={errorText}
        />
      </Modal>
    </div>
  );
};

export default ConnectStep;
