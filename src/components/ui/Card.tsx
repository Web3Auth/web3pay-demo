import React, { act } from "react";

const Card = ({
  children,
  cardClasses,
  active = false,
  rootClasses,
}: {
  children: React.ReactNode;
  cardClasses?: string;
  active?: boolean;
  rootClasses?: string;
}) => {
  return (
    <div
      className={`relative inline-flex w-max overflow-hidden rounded-30 p-[1px] focus:outline-none ${
        !active ? "border border-line" : ""
      } ${rootClasses}`}
    >
      {active && (
        <span className="animate-[spin_2s_linear_infinite] gradient-border rounded-30" />
      )}
      <span
        className={`flex flex-col h-full w-full cursor-pointer items-start rounded-30
              p-4 xl:p-6 2xl:px-9 2xl:py-6 text-base font-medium text-white backdrop-blur-3xl ${
                active ? "bg-opaque" : "bg-transparent"
              } ${cardClasses}`}
      >
        {children}
      </span>
    </div>
  );
};

export default Card;
