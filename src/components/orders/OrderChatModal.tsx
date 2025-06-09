import { useState } from "react";
import { Modal } from "../ui/modal";
import { ChatIcon } from "../../icons";

interface OrderChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemData: any;
}

export default function OrderChatModal({
  isOpen,
  onClose,
  itemId,
  itemData
}: OrderChatModalProps) {
  const [message, setMessage] = useState("");
  const handleSendMessage = () => {
    if (!message.trim()) return;

    // TODO: Implementar lógica de envio de mensagem
    console.log("Enviando mensagem:", message, "para item:", itemId);

    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg m-4 h-[80vh] max-h-[80vh]"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="p-2 bg-brand-50 dark:bg-brand-900/20 rounded-lg">
            <ChatIcon className="w-5 h-5 text-brand-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Chat do Item
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Item #{itemId.substring(0, 8)}
            </p>
          </div>
        </div>

        {/* Messages Container - Takes remaining space */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-800/50">
          <div className="flex flex-col space-y-3">
            {/* Placeholder message showing item info */}
            <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Chat iniciado para o item:{" "}
                <strong>
                  {itemData?.product_url || itemData?.product_name || "Item"},
                  ID: {itemId.substring(0, 8)}
                </strong>
              </p>
            </div>

            {/* TODO: Aqui serão renderizadas as mensagens do chat */}
            <div className="text-center text-gray-400 dark:text-gray-500 py-8">
              <ChatIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma mensagem ainda</p>
              <p className="text-xs">
                Digite uma mensagem para começar a conversa
              </p>
            </div>
          </div>
        </div>

        {/* Message Input - Fixed at bottom */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700">
          <div className="flex gap-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="flex-1 resize-none border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:focus:ring-brand-400 dark:focus:border-brand-400 outline-none"
              rows={2}
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="self-end px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              Enviar
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
