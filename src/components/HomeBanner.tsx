import React from "react";

const HomeBanner = () => {
  return (
    <div className="flex flex-col text-left gap-y-6 lg:pl-16 mt-2.5">
      <div className="text-left text-3xl sm:banner-heading-text flex flex-col gap-y-1">
        <p>Experience</p>
        <p className="gradient-text">Wallet Abstraction</p>
        <p>All in One</p>
      </div>
      <p className="text-left text-2xl font-normal w-full md:w-[482px] break-words text-gray-400">
        Experience cross chain minting without the hassle of bridging
      </p>
    </div>
  );
};

export default HomeBanner;
