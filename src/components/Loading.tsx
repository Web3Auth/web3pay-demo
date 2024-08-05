import React from "react";
import Image from "next/image";

const Loading = () => {
  return (
    <main className="flex flex-col items-center justify-center h-dvh w-full gap-y-4 relative z-1">
      <Image
        src={"/images/cross-chain-gradient.png"}
        alt="cross chain"
        width={400}
        height={400}
        className="z-0 w-full h-full opacity-25 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
      <p className="text-white text-5xl font-bold">Loading up your</p>
      <div className="loaderText !font-bold !text-5xl bg-gradient-to-r from-gradient-four to-gradient-five inline-block text-transparent bg-clip-text;">
        Web3Pay Account...
      </div>
    </main>
  );
};

export default Loading;
