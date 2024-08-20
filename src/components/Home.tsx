import React, { useState } from "react";
import ImportFlowCard from "./ui/ImportFlowCard";
import { ConnectWeb3PayStep, IRandomWallet, SelectedEnv } from "@/utils/interfaces";
import { openInNewTab, sliceAddress } from "@/utils";
import Image from "next/image";
import Card from "./ui/Card";
import { HiOutlineArrowSmRight } from "react-icons/hi";
import GradientButton from "./ui/GradientButton";
import Button from "./ui/Button";
import { calculateBaseUrl, cn } from "@/utils/utils";
import Link from "next/link";
import Faq from "./ui/Faq";
import Footer from "./Footer";
import NewsLetter from "./NewsLetter";
import Navbar from "./ui/Navbar";
import { generatePrivate, getPublic } from "@toruslabs/eccrypto";
import { privateKeyToAddress } from "viem/accounts";
import { createPublicClient, Hex, http } from "viem";
import { Modal } from "./ui/Modal";
import ErrorPopup from "./ErrorPopup";
import { waitForTransactionReceipt } from "viem/actions";
import axios from "axios";
import { arbitrumSepolia } from "viem/chains";
import { OpenloginSessionManager } from "@toruslabs/session-manager";
import { useWallet } from "@/context/walletContext";

const STEPS = {
  CONNECT: "Connect",
  CROSS_CHAIN_MINTING: "Cross_Chain_Minting",
  VIEW_SUMMARY: "View_Summary",
};

const Home = ({ address }: { address: string }) => {
  const [activeStep, setActiveStep] = useState(STEPS.VIEW_SUMMARY);
  const [displayErrorPopup, setDisplayErrorPopup] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [subErrorText, setSubErrorText] = useState("");
  const [errorRetryFunction, setErrorRetryFunction] = useState<
    () => Promise<void>
  >(() => Promise.resolve());


  return (
    <>
      <Navbar
        address={address}
        containerClass="bg-transparent"
        logoText={activeStep === STEPS.VIEW_SUMMARY ? "About Web3Pay" : ""}
      />
      <section
        className={cn(
          "flex-grow flex flex-col items-center justify-center relative z-1 bg-darkCard py-11 px-9 w-full",
          {
            "h-dvh": activeStep !== STEPS.VIEW_SUMMARY,
          }
        )}
      >
        <Image
          src={"/images/cross-chain-gradient.png"}
          alt="cross chain"
          width={500}
          height={500}
          className="z-0 w-full h-full opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />

        <div className="mt-16 flex flex-col gap-y-16 md:gap-y-20">
          {activeStep === STEPS.VIEW_SUMMARY && (
            <div className="text-center">
              <p className="text-32 sm:banner-heading-text blue-gradient-text">
                Web3Pay Demo
              </p>
              <p className="text-base md:text-2xl font-normal text-white w-full md:w-[60%] mx-auto mt-6">
                Here’s what you experienced when leveraging your EOA’s token
                liquidity for cross-chain transactions without gas fees or
                bridges
              </p>
            </div>
          )}
          {(activeStep === STEPS.CONNECT ||
            activeStep === STEPS.VIEW_SUMMARY) && (
            <ConnectStep 
              onError={(err) => {
                setSubErrorText(err);
                setDisplayErrorPopup(true);
              }}
              onSuccess={() => {
                setSubErrorText("");
                setDisplayErrorPopup(false);
                setActiveStep(STEPS.CROSS_CHAIN_MINTING);
              }}    
              showSummary={activeStep === STEPS.VIEW_SUMMARY}
              setErrorRetryFunction={(x)=> {
                setSubErrorText("");
                setDisplayErrorPopup(false);
                setErrorRetryFunction(x)
              }}
              />
          )}
          {(activeStep === STEPS.CROSS_CHAIN_MINTING ||
            activeStep === STEPS.VIEW_SUMMARY) && (
            <CrossMintingStep showSummary={activeStep === STEPS.VIEW_SUMMARY} />
          )}
          {activeStep === STEPS.VIEW_SUMMARY && (
            <div className="flex flex-col items-center justify-center gap-y-20">
              <Faq />
              <NewsLetter />
              <Footer containerClass="mb-0 p-0 sm:px-0 w-full md:w-[90%]" />
            </div>
          )}
        </div>
      </section>
      <Modal
        isOpen={displayErrorPopup}
        onClose={() => setDisplayErrorPopup(false)}
      >
        <ErrorPopup
          handleTryAgain={() => errorRetryFunction()}
          subText={subErrorText}
          text={errorText}
        />
      </Modal>
    </>
  );
};

export default Home;

const ConnectStep = ({ 
  showSummary = false, 
  onError, 
  onSuccess,
  setErrorRetryFunction,
}: { 
  showSummary?: boolean, 
  onError: (err: string) => void, 
  onSuccess: () => void,
  setErrorRetryFunction:  React.Dispatch<React.SetStateAction<() => Promise<void>>>
 }) => {
  const [randomWallet, setRandomWallet] = useState<IRandomWallet>();
  const [completedSteps, setCompletedSteps] = useState<ConnectWeb3PayStep[]>(
    []
  );
  const [currentStep, setCurrentStep] = useState<ConnectWeb3PayStep>("start");
  const [stepLoader, setStepLoader] = useState(false);

  const { walletProvider, address: web3PayAddress, selectedEnv } = useWallet();

  const handleStep = async (step: ConnectWeb3PayStep) => {
    switch (step) {
      case "start": 
        await handleCreateAndFundRandomWallet();
        break;
      case "connect":
        await importAccount(randomWallet as IRandomWallet);
        break;
      default:
        break;
    }
  }
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
      setRandomWallet({
        publicKey,
        privateKey,
        address,
        keyType: "secp256k1",
      });
      setCompletedSteps([...completedSteps, "start"]);
      setCurrentStep("connect");
    } catch (err: any) {
      console.error("error while creating random wallet", err);
      onError("Error while creating or funding wallet");
      setErrorRetryFunction(() => handleCreateAndFundRandomWallet());
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

    } catch (error: any) {
      onError("Error while Funding Wallet");
      // check if user has enough balance and proceed to next step
    } finally {
      setStepLoader(false);
    }
  }

  async function importAccount(randWallet: IRandomWallet) {
    try {
      setStepLoader(true);
      if (web3PayAddress) {
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
        setCompletedSteps([...completedSteps, "connect"]);

        onSuccess();
      }
    } catch (e: unknown) {
      console.error("error importing account", e);
      onError("Error while connecting account");
      throw e;
    } finally {
      setStepLoader(true);
    }
  }
  return (
    <div className="flex flex-col items-center justify-center">
      {!showSummary && (
        <>
          <p className="text-4xl font-bold">Connecting with Web3Pay</p>
          <p className="text-2xl font-normal mt-2 w-full md:w-[60%] text-center">
            For demo purposes, a test funded wallet will be used instead of your
            external EOA wallets
          </p>
        </>
      )}
      <div
        className={cn(
          "mt-16 w-full flex items-center flex-col sm:flex-row justify-center lg:w-[85%] xl:w-[60%]",
          { "mt-0": showSummary }
        )}
      >
        <ImportFlowCard
          title="Create your funded wallet on Arbitrum"
          description="Get a funded test wallet for the demo that will stand in for your external wallets"
          step="1"
          isCompleted={completedSteps.includes("start")}
          isCurrent={currentStep === "start"}
          logo="arbitrum"
          resultOpacity
          resultText={sliceAddress(randomWallet?.address || "")}
          resultLogo="arbitrum"
          handleClick={() => handleStep('start')}
          btnText="Create test wallet"
          loading={stepLoader}
          handleCompletedLink={() =>
            openInNewTab(
              `https://sepolia.arbiscan.io/address/${randomWallet?.address}`
            )
          }
        />
        <Image
          src="/icons/arrow-right.svg"
          alt="arrow"
          height={50}
          width={50}
          className="rotate-90 my-5 mx-auto block md:hidden"
        />
        <Image
          src="/icons/arrow-white.svg"
          alt="arrow"
          height={100}
          width={100}
          className="hidden md:block"
        />
        <ImportFlowCard
          title="Connect your wallet to Web3Pay Account"
          description="Allow your Web3Pay Account to access liquidity from your test wallet."
          step="2"
          isCompleted={completedSteps.includes("connect")}
          isCurrent={currentStep === "connect"}
          logo="arbitrum"
          resultOpacity
          resultText={sliceAddress(randomWallet?.address || "")}
          resultLogo="arbitrum"
          handleClick={() => handleStep("connect")}
          btnText="Connect Test Wallet"
          loading={stepLoader}
          handleCompletedLink={() =>
            openInNewTab(
              `https://sepolia.arbiscan.io/address/${randomWallet?.address}`
            )
          }
        />
      </div>
    </div>
  );
};


const CrossMintingStep = ({
  showSummary = false,
}: {
  showSummary?: boolean;
}) => {
  const [isSuccess, setIsSuccess] = useState(true);
  return (
    <div className="flex flex-col items-center justify-center w-full">
      {!showSummary && (
        <>
          <p className="text-4xl font-bold">
            {isSuccess ? "Cross-Chain Minting" : "Connecting with Web3Pay"}
          </p>
          <p className="text-2xl font-normal mt-2 w-full md:w-[60%] text-center">
            {isSuccess
              ? "Next, use funds from your test wallet to mint your first NFT on a different chain."
              : "For demo purposes, a test funded wallet will be used instead of your external EOA wallets"}
          </p>
          {isSuccess && (
            <Button
              title="View Demo Summary"
              otherClasses="bg-primary"
              style={{ marginTop: "24px" }}
            />
          )}
        </>
      )}
      <div
        className={cn("w-full xl:w-[80%] mt-16", {
          "mt-10": isSuccess,
          "mt-0": showSummary,
        })}
      >
        <Card
          active
          cardClasses={`${
            isSuccess ? "!p-6 md:!px-16 md:!py-10" : "!p-0"
          } !w-full bg-primary`}
          rootClasses="!w-full"
        >
          <div
            className={cn("flex flex-col md:flex-row items-start gap-x-16", {
              "items-center": isSuccess,
            })}
          >
            {isSuccess ? (
              <span className="relative w-full md:w-[50%]">
                <Image
                  src={"/images/web3pay-nft.png"}
                  alt="cross chain nft mint"
                  height={300}
                  width={300}
                  className="w-full h-full md:w-[300px] md:h-[300px]"
                />
                <Image
                  src={`/icons/polygon.svg`}
                  alt={"polygon"}
                  height={50}
                  width={50}
                  className="absolute -top-3 -right-3"
                />
              </span>
            ) : (
              <Image
                src={"/images/cross-chain-nft-mint.png"}
                alt="cross chain nft mint"
                height={500}
                width={400}
                className="w-full h-full"
              />
            )}
            <div
              className={cn("flex flex-col w-full p-10 md:pl-0 h-full", {
                "p-0 mt-6": isSuccess,
              })}
            >
              <div className="flex items-center gap-x-2 w-fit">
                <Image
                  src={`/icons/arbitrum.svg`}
                  alt={"arbitrum"}
                  height={30}
                  width={30}
                />
                <HiOutlineArrowSmRight />
                <Image
                  src={`/icons/polygon.svg`}
                  alt={"polygon"}
                  height={30}
                  width={30}
                />
              </div>
              <p className="text-2xl font-bold text-white w-full mt-4 break-words">
                {isSuccess
                  ? "MINT SUCCESSFUL!"
                  : "Mint your first cross-chain NFT with Web3Pay!"}
              </p>
              <p
                className={cn(
                  "text-lg font-normal text-gray-400 w-full md:w-[70%] mt-2 mb-6 break-words",
                  {
                    "md:w-[80%] mb-0": isSuccess,
                  }
                )}
              >
                {isSuccess
                  ? showSummary
                    ? "Hooray! You just minted a polygon NFT with Arbitrum tokens! "
                    : "You just minted a polygon NFT with Arbitrum tokens! It should appear in your wallet in about 5 minutes."
                  : "Use your Arbitrum Test Tokens to mint an NFT on Polygon, no bridging required."}
              </p>
              {isSuccess && (
                <Link
                  href={""}
                  className="text-lg font-normal text-blue-500 mt-6"
                >
                  View transaction on Polygon
                </Link>
              )}
              {isSuccess && (
                <Link
                  href={""}
                  className="text-lg font-normal text-blue-500 mt-2"
                >
                  View transaction on Arbitrum
                </Link>
              )}
              {isSuccess ? (
                <Button
                  title="Share your experience on X"
                  otherClasses="bg-primary max-md:!w-full"
                  style={{ marginTop: "24px" }}
                />
              ) : (
                <GradientButton
                  title="Mint NFT"
                  handleClick={() => {}}
                  btnClass="max-md:!w-full"
                />
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};



