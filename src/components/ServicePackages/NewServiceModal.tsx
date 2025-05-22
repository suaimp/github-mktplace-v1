import { useState, useEffect } from "react";
/* components */
import Button from "../ui/button/Button";
import ToastMessage from "../ui/ToastMessage/ToastMessage";
/* db */
import { getForms } from "../../context/db-context/services/formsService"; // importe aqui
import { createPublisherService } from "../../context/db-context/services/publisherService";

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
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Simulação de busca dos formulários da rota /forms
  useEffect(() => {
    async function fetchForms() {
      const forms = await getForms();
      console.log("Resultado do getForms:", forms);
      if (forms) {
        setFormOptions(
          forms.map((form: any) => ({
            id: form.id,
            name: form.title // usa o campo title da tabela
          }))
        );
      }
    }

    fetchForms();
  }, []);

  const newServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceTitle || !serviceType || !productType) return;
    const result = await createPublisherService({
      service_title: serviceTitle,
      service_type: serviceType,
      product_type: productType
    });
    if (result) {
      setShowSuccess(true);
      setSuccessMsg("Serviço cadastrado com sucesso!");
      setOpen(false);
      setServiceTitle("");
      setServiceType("Conteúdo");
      setProductType("");
      setTimeout(() => setShowSuccess(false), 4000);
    } else {
      setShowError(true);
      setErrorMsg(
        "Erro ao criar serviço. Tente novamente ou entre em contato com o suporte."
      );
      setTimeout(() => setShowError(false), 3000);
    }
  };

  return (
    <>
      <ToastMessage
        show={showSuccess}
        message={successMsg}
        type="success"
        top={90}
        onClose={() => setShowSuccess(false)}
      />
      <ToastMessage
        show={showError}
        message={errorMsg}
        type="error"
        top={90}
        onClose={() => setShowError(false)}
      />
      <div className="mb-6">
        <Button onClick={() => setOpen(true)}>
          {" "}
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
                  className="w-full border rounded px-3 py-2 text-black"
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
                  className="w-full border rounded px-3 py-2 text-black"
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
                  className="w-full border rounded px-3 py-2 text-black"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  required
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
