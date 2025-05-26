import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
/* components */
import Button from "../ui/button/Button";
import ToastMessage from "../ui/ToastMessage/ToastMessage";
/* db */
import { getForms } from "../../context/db-context/services/formsService"; // importe aqui
import { createPublisherService } from "../../context/db-context/services/publisherService";
import { useServicePackages } from "../../context/ServicePackages/ServicePackagesContext";
import { getCurrentUser } from "../../lib/supabase";

interface FormOption {
  id: string;
  name: string;
}

interface NewServiceBaseModalProps {
  field: {
    label?: string;
    modalTitle?: string;
  };
}

const serviceTypes = [
  { value: "Conteúdo", label: "Conteúdo" },
  { value: "Patrocinio", label: "Patrocinio" },
  { value: "Radio", label: "Radio" }
  // Adicione outros tipos conforme necessário
];

export default function NewServiceBaseModal({
  field
}: NewServiceBaseModalProps) {
  const [open, setOpen] = useState(false);
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
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null); // Adicionado para armazenar o usuário
  const { fetchServices } = useServicePackages();

  useEffect(() => {
    async function fetchForms() {
      const forms = await getForms();
      console.log("Resultado do getForms:", forms);
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

  useEffect(() => {
    async function fetchUserRole() {
      const userInfo = await getCurrentUser();
      if (!userInfo) {
        setUserRole(null);
        setUserInfo(null); // Limpa userInfo se não houver usuário
        return;
      }
      setUserInfo(userInfo); // Salva userInfo
      if (userInfo.type === "admin") {
        setUserRole("admin");
      } else if (userInfo.type === "platform") {
        setUserRole(userInfo.data.role || "platform");
      }
    }
    fetchUserRole();
  }, []);

  // Atualiza automaticamente o tipo de produto conforme o tipo de serviço selecionado
  useEffect(() => {
    if (!serviceType || formOptions.length === 0) return;
    let targetName = "";
    if (serviceType === "Conteúdo") targetName = "cadastro de sites";
    else if (serviceType === "Radio") targetName = "Radios";
    else if (serviceType === "Patrocinio") targetName = "serv32";
    if (targetName) {
      // Ignora espaços extras e faz comparação case-insensitive
      const found = formOptions.find(
        (form) =>
          form.name.trim().toLowerCase() === targetName.trim().toLowerCase()
      );
      if (found) setProductType(found.id);
    }
  }, [serviceType, formOptions]);

  // Substitui showSuccess/showError/successMsg/errorMsg por addToast
  function addToast(message: string, type: "success" | "error") {
    const id = uuidv4();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }

  const newServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceTitle || !serviceType || !productType || !userInfo) return;
    const payload: any = {
      service_title: serviceTitle,
      service_type: serviceType,
      product_type: productType
    };
    if (userRole === "admin") {
      payload.admin_id = userInfo.user.id;
    } else {
      payload.user_id = userInfo.user.id;
    }
    const result = await createPublisherService(payload);
    if (result) {
      addToast("Serviço cadastrado com sucesso!", "success");
      setOpen(false);
      setServiceTitle("");
      setServiceType("Conteúdo");
      setProductType("");
      fetchServices(); // atualiza a tabela via contexto
    } else {
      addToast(
        "Erro ao criar serviço. Tente novamente ou entre em contato com o suporte.",
        "error"
      );
    }
  };

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
        />
      ))}
      <div className="mb-6">
        <Button onClick={() => setOpen(true)}>
          {field.label || "Abrir Modal"}
        </Button>
      </div>

      {open && (
        <div
          onMouseDown={() => setOpen(false)}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-400/50 backdrop-blur-[--background-blur] dark:text-white"
        >
          <div
            onMouseDown={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md"
          >
            <h2 className="text-lg font-semibold mb-4">
              {field.modalTitle || "Novo Serviço"}
            </h2>
            <form className="space-y-4" onSubmit={newServiceSubmit}>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Título do serviço
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-black dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tipo de serviço
                </label>
                <select
                  className="w-full border rounded px-3 py-2 text-black dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  required
                >
                  {serviceTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tipo de Produto
                </label>
                <select
                  className="w-full border rounded px-3 py-2 text-black appearance-none !bg-none dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  required
                  disabled
                  style={{ backgroundImage: "none" }}
                >
                  <option value="">Selecione um formulário</option>
                  {formOptions.map((form) => (
                    <option key={form.id} value={form.id}>
                      {form.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setServiceTitle("");
                    setServiceType("Conteúdo");
                    setProductType("");
                  }}
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
