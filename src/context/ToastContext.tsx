"use client";

import { Toast, ToastObj, ToastType } from "@/components/ui/Toast";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

interface ToastContextType {
  addToast: (
    type: ToastType,
    message: string,
    icon?: React.ReactNode,
    style?: string,
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastId = 0;

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastObj[]>([]);
  const [customIcon, setCustomIcon] = useState<React.ReactNode | null>(null);
  const [customStyle, setCustomStyle] = useState<string | null>("");

  const removeToast = useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (
      type: ToastType,
      message: string,
      icon?: React.ReactNode,
      style?: string,
    ) => {
      setToasts((prevToasts) => [
        ...prevToasts,
        { id: ++toastId, type, message },
      ]);
      if (icon) setCustomIcon(icon || null);
      if (style) setCustomStyle(style || null);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <Toast
        position="top-center"
        limit={1}
        toasts={toasts}
        removeToast={removeToast}
        icon={customIcon}
      />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
