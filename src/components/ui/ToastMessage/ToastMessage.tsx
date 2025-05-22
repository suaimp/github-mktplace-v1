interface ToastMessageProps {
  show: boolean;
  message: string;
  type?: "success" | "error";
  top?: number;
  onClose?: () => void;
}

export default function ToastMessage({
  show,
  message,
  type = "success",
  top = 24,
  onClose
}: ToastMessageProps) {
  return (
    <div
      className={`fixed right-0 z-[999999] transition-transform duration-500 ${
        show ? "translate-x-0" : "translate-x-full"
      } ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      } text-white px-6 py-3 rounded-l-lg shadow-lg flex items-center`}
      style={{ minWidth: 220, top }}
      onClick={onClose}
    >
      {message}
    </div>
  );
}
