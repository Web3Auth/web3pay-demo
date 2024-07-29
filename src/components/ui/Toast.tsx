"use client";

import { cn } from "@/utils/utils";
import React, { useEffect } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineInformationCircle,
  HiOutlineExclamationCircle,
} from "react-icons/hi";

export type ToastType = "success" | "warning" | "error" | "info" | "default";
export type Position =
  | "top-center"
  | "bottom-center"
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left";

export interface ToastObj {
  id: number;
  type: ToastType;
  message: string;
}

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  position: Position;
  limit: number;
  toasts: ToastObj[];
  removeToast: (id: number) => void;
  icon?: React.ReactNode;
  toastStyle?: string;
  pill?: boolean;
}

const icons = {
  success: HiOutlineCheckCircle,
  warning: HiOutlineExclamationCircle,
  error: HiOutlineExclamationCircle,
  info: HiOutlineInformationCircle,
  default: HiOutlineInformationCircle,
};

const colors = {
  success: "bg-green-600 text-app-white",
  warning: "bg-yellow-600 text-app-white",
  error: "bg-red-600 text-app-white",
  info: "bg-blue-600 text-app-white",
  default: "bg-app-gray-900 text-app-white",
};

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      className,
      position = "top-center",
      limit,
      toasts,
      removeToast,
      icon,
      toastStyle,
      pill = true,
      ...props
    },
    ref,
  ) => {
    useEffect(() => {
      const timers = toasts.map((toast) =>
        setTimeout(() => {
          removeToast(toast.id);
        }, 3000),
      );
      return () => {
        timers.forEach((timer) => clearTimeout(timer));
      };
    }, [toasts, removeToast]);

    const positionClasses = cn({
      "fixed top-0 left-1/2 transform -translate-x-1/2":
        position === "top-center",
      "fixed bottom-0 left-1/2 transform -translate-x-1/2":
        position === "bottom-center",
      "fixed top-0 right-0": position === "top-right",
      "fixed top-0 left-0": position === "top-left",
      "fixed bottom-0 right-0": position === "bottom-right",
      "fixed bottom-0 left-0": position === "bottom-left",
    });

    return (
      <div
        className={cn(positionClasses, "z-[1000] w-full")}
        {...props}
        ref={ref}
        role="alert"
      >
        {toasts.slice(0, limit).map((toast) => {
          const Icon = icons[toast.type];
          const colorClass = colors[toast.type];

          return (
            <div
              key={toast.id}
              className={cn(
                `flex items-center px-6 py-4 m-4 mt-6 mx-auto max-w-[20rem] w-fit rounded-lg shadow-lg`,
                { "rounded-full": pill },
                colorClass,
                toastStyle,
              )}
            >
              {icon ? (
                <span className="mr-2">{icon}</span>
              ) : (
                <Icon className="w-6 h-6 mr-2" />
              )}
              <div className="text-base font-normal">{toast.message}</div>
            </div>
          );
        })}
      </div>
    );
  },
);

Toast.displayName = "Toast";

export { Toast };
