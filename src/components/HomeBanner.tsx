import React from "react";

const HomeBanner = () => {
  return (
    <div className="flex flex-col text-left gap-y-6 mt-20 ml-20">
      <div className="text-left banner-heading-text">
        <p>Experience</p>
        <p className="gradient-text">Wallet Abstraction</p>
        <p>All in One</p>
      </div>
      <p className="text-left text-2xl font-normal w-[482px] break-words">
        Experience cross chain minting without the hassle of bridging
      </p>
    </div>
  );
};

export default HomeBanner;
