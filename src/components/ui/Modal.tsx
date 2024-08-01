import React, { useEffect } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/utils";
import { HiOutlineX } from "react-icons/hi";

const modalVariants = cva(
  `absolute bg-[#111928] text-black rounded-[30px] p-6 w-[90%] sm:w-[430px]`,
  {
    variants: {
      position: {
        top: "top-0 transform -translate-x-1/2",
        bottom: "bottom-6 transform -translate-x-1/2",
        right: "right-0 transform -translate-y-1/2",
        left: "left-0 transform -translate-y-1/2",
        default: "transform -translate-x-1/2 -translate-y-1/2",
      },
      defaultVariants: {
        position: "left",
      },
    },
  }
);

export interface ModalProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalVariants> {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  clearIcon?: boolean;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      className,
      isOpen,
      position,
      onClose,
      children,
      clearIcon = true,
      ...props
    },
    ref
  ) => {
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }

      return () => {
        document.body.style.overflow = "unset";
      };
    }, [isOpen]);

    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleEscape);

      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }, [onClose]);

    if (!isOpen) return null;

    return (
      <div
        className={cn(
          `fixed w-full inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 transition-opacity duration-300 ${
            isOpen ? "opacity-100 animate-fadeIn" : "opacity-0 animate-fadeOut"
          }`
        )}
        onClick={onClose}
      >
        <div
          ref={ref}
          className={cn(
            modalVariants({ position, className }),
            `transition-transform duration-500 ${
              isOpen ? "scale-100 animate-scaleIn" : "scale-75 animate-scaleOut"
            }`
          )}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {children}
          {clearIcon && (
            <button
              onClick={onClose}
              className="hover:bg-app-gray-100 dark:hover:bg-app-gray-600 text-black dark:text-white 
              absolute top-4 right-6 h-6 w-6 hover:bg-darkCard flex items-center justify-center text-xs rounded-full"
            >
              <HiOutlineX className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

Modal.displayName = "Modal";

export { Modal, modalVariants };
