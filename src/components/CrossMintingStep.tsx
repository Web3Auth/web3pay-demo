import { useWallet } from "@/context/walletContext";
import { calculateBaseUrl, cn, nftContractAddress } from "@/utils/utils";
import Link from "next/link";
import Image from "next/image";
import { bundlerActions, ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { useState } from "react";
import { HiOutlineArrowSmRight } from "react-icons/hi";
import { encodeFunctionData, Hex, createClient, http } from "viem";
import { polygonAmoy } from "viem/chains";
import Button from "./ui/Button";
import Card from "./ui/Card";
import GradientButton from "./ui/GradientButton";
import { erc721Abi } from "@/utils/abis/erc721";
import ErrorPopup from "./ErrorPopup";
import { Modal } from "./ui/Modal";
import { useRouter } from "next/navigation";
import { openInNewTab } from "@/utils";
import useMintStore from "@/lib/store/mint";

const CrossMintingStep = ({
  showSummary = false,
  onSuccess,
}: {
  showSummary?: boolean;
  onSuccess: () => void;
}) => {
  const router = useRouter();
  const { resetMintState, mintNftState, setMintNftState } = useMintStore();
  const {
    walletProvider,
    address: web3PayAddress,
    selectedEnv,
    setLoggedIn,
  } = useWallet();
  const [displayErrorPopup, setDisplayErrorPopup] = useState(false);
  const [errorStep, setErrorStep] = useState<string | undefined>();
  const [errorText, setErrorText] = useState("");
  const [subErrorText, setSubErrorText] = useState("");

  async function mintNft() {
    try {
      setMintNftState({
        mintError: "",
        waitForMintSuccess: false,
        minting: true,
        mintSuccess: false,
        userOpHashUrl: "",
        txHashUrl: "",
      });
      const data = encodeFunctionData({
        abi: erc721Abi,
        functionName: "mint",
        args: [web3PayAddress],
      });

      const resp = await walletProvider?.request({
        method: "eth_sendTransaction",
        params: {
          from: web3PayAddress,
          to: nftContractAddress,
          data,
          value: "0",
        },
      });
      if (resp) {
        // setMintSuccess(true);
        setMintNftState({
          mintError: "",
          minting: false,
          waitForMintSuccess: true,
          mintSuccess: false,
          userOpHashUrl: `https://jiffyscan.xyz/userOpHash/${resp}`,
          txHashUrl: "",
        });
        await waitForMinting(resp);
      }
      const nftImageUrl = `${calculateBaseUrl(
        selectedEnv
      )}/wallet/nft/${nftContractAddress}`;
    } catch (e: unknown) {
      console.error("error minting nft", e);
      const walletError = e as { code: number; message: string };
      if (walletError.code === 4100) {
        // unauthorized, user not logged in
        setLoggedIn(false);
        router.push("/");
      }
      setErrorStep("mintNft");
      setErrorText(walletError.message || "Error while minting");
      setDisplayErrorPopup(true);
      setMintNftState({
        mintError: "Error while minting",
        minting: false,
        waitForMintSuccess: false,
        mintSuccess: false,
        userOpHashUrl: "",
        txHashUrl: "",
      });
    } finally {
    }
  }

  async function waitForMinting(hash: Hex) {
    const bundlerClient = createClient({
      chain: polygonAmoy,
      transport: http("https://rpc-proxy.web3auth.io/?network=80002"),
    }).extend(bundlerActions(ENTRYPOINT_ADDRESS_V07));

    // wait for user op hash to be completed
    const userOperationByHash = await bundlerClient.waitForUserOperationReceipt(
      {
        hash,
        timeout: 1000 * 60 * 3,
        pollingInterval: 1000 * 3,
      }
    );
    if (userOperationByHash.receipt) {
      setMintNftState({
        mintError: "",
        minting: false,
        waitForMintSuccess: false,
        mintSuccess: true,
        userOpHashUrl: `https://jiffyscan.xyz/userOpHash/${hash}`,
        txHashUrl: `https://amoy.polygonscan.com/tx/${userOperationByHash.receipt.transactionHash}`,
      });
    }
  }

  async function onRetry() {
    try {
      await mintNft();
    } catch (e: unknown) {
      console.error("error on retrying mint", e);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {!showSummary && (
        <>
          <p className="text-3xl md:text-4xl font-bold text-center">
            Cross-Chain Minting
          </p>
          <p className="text-base md:text-2xl font-normal mt-2 w-full md:w-[60%] text-center">
            Next, use funds from your test wallet to mint your first NFT on a
            different chain.
          </p>
          {mintNftState.txHashUrl && (
            <Button
              onClick={() => onSuccess()}
              title="View Demo Summary"
              otherClasses="bg-primary"
              style={{ marginTop: "24px" }}
            />
          )} 
        </>
      )}
      <div
        className={cn("w-full xl:w-[90%] mt-16", {
          "mt-10": mintNftState.mintSuccess,
          "mt-0": showSummary,
        })}
      >
        <Card
          active
          cardClasses={`${
            mintNftState.mintSuccess ? "!p-6 md:!px-16 md:!py-10" : "!p-0"
          } !w-full bg-primary`}
          rootClasses="!w-full"
        >
          <div
            className={cn("flex flex-col md:flex-row items-start gap-x-16", {
              "items-center": mintNftState.mintSuccess,
            })}
          >
            {mintNftState.mintSuccess ? (
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
                "p-0 mt-6": mintNftState.mintSuccess,
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
                {mintNftState.mintSuccess
                  ? "MINT SUCCESSFUL!"
                  : "Mint your first cross-chain NFT with Web3Pay!"}
              </p>
              <p
                className={cn(
                  "text-lg font-normal text-gray-400 w-full md:w-[80%] mt-2 mb-6 break-words",
                  {
                    "md:w-[80%] mb-0": mintNftState.mintSuccess,
                  }
                )}
              >
                {mintNftState.mintSuccess
                  ? showSummary
                    ? "Hooray! You just minted a polygon NFT with Arbitrum tokens!"
                    : "You just minted a polygon NFT with Arbitrum tokens! It should appear in your wallet in about 5 minutes."
                  : "Use your Arbitrum Test Tokens to mint an NFT on Polygon, no bridging required."}
              </p>
              {mintNftState.mintSuccess && (
                <Link
                  target="_blank"
                  href={mintNftState.txHashUrl || mintNftState.userOpHashUrl}
                  className="text-lg font-normal text-blue-500 mt-6"
                >
                  View transaction on Polygon
                </Link>
              )}
              {/* {mintNftState.mintSuccess && (
                <Link
                  href={""}
                  className="text-lg font-normal text-blue-500 mt-2"
                >
                  View transaction on Arbitrum
                </Link>
              )} */}
              {mintNftState.mintSuccess ? (
                <Button
                  title="Share your experience on X"
                  otherClasses="bg-primary max-md:!w-full"
                  style={{ marginTop: "24px" }}
                  onClick={() => {
                    openInNewTab(
                      "https://twitter.com/intent/tweet?text=I%27ve%20managed%20to%20mint%20an%20NFT%20on%20Polygon%20using%20Arbitrum%20tokens!%20Try%20it%20here!%20%23web3pay&url=https://demo-web3pay.tor.us/home"
                    );
                  }}
                />
              ) : (
                <GradientButton
                  loading={mintNftState.minting || mintNftState.waitForMintSuccess}
                  title="Mint NFT"
                  handleClick={() => {
                    mintNft();
                  }}
                  btnClass={`max-md:!w-full ${mintNftState.waitForMintSuccess? 'opacity-25 pointer-events-none': ''} `}

                />
              )}
              { mintNftState.waitForMintSuccess && 
               <div className="mt-5"> Minting In Progress.... </div>}
            </div>
          </div>
        </Card>
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

export default CrossMintingStep;
