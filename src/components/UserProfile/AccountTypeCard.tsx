import { useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { supabase } from "../../lib/supabase";

interface AccountTypeCardProps {
  profile: any;
  onUpdate: () => void;
}

export default function AccountTypeCard({ profile, onUpdate }: AccountTypeCardProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Tipo de Conta
        </h3>
        <Button onClick={openModal}>Editar</Button>
      </div>

      <p className="text-gray-500 dark:text-gray-400">
        Funcionalidade em desenvolvimento. Em breve você poderá gerenciar seu tipo de conta aqui.
      </p>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Editar Tipo de Conta
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Atualize seu tipo de conta
            </p>
          </div>

          <form className="flex flex-col">
            <div className="px-2 pb-3">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5">
                <div>
                  <Label>Plano Atual</Label>
                  <Input
                    type="text"
                    placeholder="Em desenvolvimento..."
                    disabled
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Fechar
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}