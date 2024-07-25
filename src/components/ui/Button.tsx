import React from "react";
import Loader from "./Loader";

const Button = ({
  title,
  icon,
  position,
  handleClick,
  otherClasses,
  loading,
}: {
  title: string;
  icon?: React.ReactNode;
  position?: string;
  handleClick?: () => void;
  otherClasses?: string;
  loading?: boolean;
}) => {
  return (
    <button
      className="relative inline-flex h-12 w-max overflow-hidden rounded-full p-[1px] focus:outline-none"
      onClick={handleClick}
    >
      <span className="animate-[spin_2s_linear_infinite] gradient-border rounded-full" />
      <span
        className={`inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full
             bg-opaque px-9 py-5 text-base font-medium text-white backdrop-blur-3xl gap-2 ${otherClasses}`}
      >
        {loading ? (
          <Loader size="xs" />
        ) : (
          <>
            {position === "left" && icon}
            {title}
            {position === "right" && icon}
          </>
        )}
      </span>
    </button>
  );
};

export default Button;
