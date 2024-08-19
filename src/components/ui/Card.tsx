import { cn } from "@/utils/utils";
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
      className={cn(
        "relative inline-flex w-max overflow-hidden rounded-30 p-[1px] focus:outline-none",
        {
          "border border-line": !active,
        },
        rootClasses
      )}
    >
      {active && (
        <span className="animate-[spin_2s_linear_infinite] gradient-border rounded-30" />
      )}
      <span
        className={cn(
          "flex flex-col h-full w-full cursor-default items-start rounded-30 p-4 xl:p-6 2xl:px-9 2xl:py-6 text-base font-medium text-white backdrop-blur-3xl",
          {
            "bg-opaque": active,
            "bg-transparent": !active,
          },
          cardClasses
        )}
      >
        {children}
      </span>
    </div>
  );
};

export default Card;
