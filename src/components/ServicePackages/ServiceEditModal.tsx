import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
/* components */

import ToastMessage from "../ui/ToastMessage/ToastMessage";
/* db */
import { getForms } from "../../context/db-context/services/formsService";
import {
  updatePublisherService,
  getPublisherServiceById
} from "../../context/db-context/services/publisherService";
import { useServicePackages } from "../../context/ServicePackages/ServicePackagesContext";

interface FormOption {
  id: string;
  name: string;
}

interface ServiceEditModalProps {
  serviceId: string;
  open: boolean;
  onClose: () => void;
}

const serviceTypes = [
  { value: "Conteúdo", label: "Conteúdo" },
  { value: "Patrocinio", label: "Patrocinio" },
  { value: "Radio", label: "Radio" }
  // Adicione outros tipos conforme necessário
];

export default function ServiceEditModal({
  serviceId,
  open,
  onClose
}: ServiceEditModalProps) {
  const [serviceTitle, setServiceTitle] = useState("");
  const [serviceType, setServiceType] = useState("Conteúdo");
  const [productType, setProductType] = useState("");
  const [formOptions, setFormOptions] = useState<FormOption[]>([]);
  const [toasts, setToasts] = useState<
    {
      id: string;
      message: string;
      type: "success" | "error";
    }[]
  >([]);
  const { fetchServices } = useServicePackages();

  // Carrega os dados do serviço ao abrir o modal
  useEffect(() => {
    if (open && serviceId) {
      (async () => {
        const service = await getPublisherServiceById(serviceId);
        if (service) {
          setServiceTitle(service.service_title);
          setServiceType(service.service_type);
          setProductType(service.product_type);
        }
      })();
    }
  }, [open, serviceId]);

  // Carrega as opções de formulário
  useEffect(() => {
    async function fetchForms() {
      const forms = await getForms();
      if (forms) {
        setFormOptions(
          forms.map((form: any) => ({
            id: form.id,
            name: form.title
          }))
        );
      }
    }
    fetchForms();
  }, []);

  function addToast(message: string, type: "success" | "error") {
    const id = uuidv4();
    setToasts((prev) => [...prev, { id, message, type }]);
    // Remove o toast após 4s, mas só se ele ainda existir (previne race condition)
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceTitle || !serviceType || !productType) return;
    const result = await updatePublisherService(serviceId, {
      service_title: serviceTitle,
      service_type: serviceType,
      product_type: productType
    });
    if (result) {
      addToast("Serviço atualizado com sucesso!", "success");
      setTimeout(() => {
        onClose();
        fetchServices();
      }, 400);
    } else {
      addToast(
        "Erro ao atualizar serviço. Tente novamente ou entre em contato com o suporte.",
        "error"
      );
    }
  };

  // Toasts empilhados e animados
  return (
    <>
      {toasts.map((toast, idx) => (
        <ToastMessage
          key={toast.id}
          show={true}
          message={toast.message}
          type={toast.type}
          top={90 + idx * 60}
          onClose={() => {
            setToasts((prev) => prev.filter((t) => t.id !== toast.id));
          }}
          className={`toast-anim-${toast.id}`}
        />
      ))}
      {open && (
        <div
          onMouseDown={onClose}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-400/50 backdrop-blur-[--background-blur] dark:text-white"
        >
          <div
            onMouseDown={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md"
          >
            <h2 className="text-lg font-semibold mb-4">Editar Serviço</h2>
            <form className="space-y-4" onSubmit={handleEditSubmit}>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Título do serviço
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-black"
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 text-white rounded hover:bg-brand-600 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
