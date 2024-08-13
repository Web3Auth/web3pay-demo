import React, { ButtonHTMLAttributes } from "react";
import Loader from "./Loader";

interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  icon?: React.ReactNode;
  position?: "left" | "right";
  handleClick?: () => void;
  otherClasses?: string;
  loading?: boolean;
  cursorClassName?: string;
}

const Button: React.FC<IButtonProps> = ({
  title,
  icon,
  position = "right",
  handleClick,
  otherClasses,
  loading,
  cursorClassName,
  ...props
}) => {
  return (
    <button
      className="relative inline-flex h-12 w-max overflow-hidden rounded-full p-[1px] focus:outline-none"
      onClick={handleClick}
      {...props}
    >
      <span className="animate-[spin_2s_linear_infinite] gradient-border rounded-full" />
      <span
        className={`inline-flex h-full w-full ${cursorClassName ? cursorClassName : "cursor-pointer" } items-center justify-center rounded-full
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
