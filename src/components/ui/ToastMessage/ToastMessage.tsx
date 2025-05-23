import { useRef, useEffect, useState } from "react";

interface ToastMessageProps {
  show: boolean;
  message: string;
  type?: "success" | "error";
  top?: number;
  onClose?: () => void;
  className?: string;
}

export default function ToastMessage({
  show,
  message,
  type = "success",
  top = 24,
  onClose,
  className
}: ToastMessageProps) {
  const toastRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Monta e anima entrada
  useEffect(() => {
    if (show) {
      setShouldRender(true);
      setTimeout(() => setVisible(true), 10);
    } else if (!show && visible) {
      setVisible(false);
    }
    // eslint-disable-next-line
  }, [show]);

  // Só desmonta após a animação de saída
  useEffect(() => {
    if (!visible && shouldRender) {
      const timeout = setTimeout(() => {
        setShouldRender(false);
        if (onClose) onClose();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [visible, shouldRender, onClose]);

  const handleClose = () => {
    setVisible(false);
  };

  if (!shouldRender) return null;

  return (
    <div
      ref={toastRef}
      className={`fixed right-0 z-[999999] transition-transform duration-500 ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      } text-white px-6 py-3 rounded-l-lg shadow-lg flex items-center ${
        className || ""
      }`}
      style={{
        minWidth: 220,
        top,
        transform: visible ? "translateX(0)" : "translateX(100%)"
      }}
      onClick={handleClose}
    >
      {message}
    </div>
  );
}
