import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { postModalService } from "./services/ModalServicePost";
import Button from "../../ui/button/Button";

// Corrigir ButtonModalFieldProps para remover props não usadas
interface ButtonModalFieldProps {
  field: any;
}

export default function ButtonModalField({ field }: ButtonModalFieldProps) {
  const [open, setOpen] = useState(false);
  const [serviceTitle, setServiceTitle] = useState("");
  const [price, setPrice] = useState("");
  const [promoPrice, setPromoPrice] = useState("");
  const [label, setLabel] = useState("Publicação comercial");
  const [features, setFeatures] = useState<string[]>([""]);
  const [userId, setUserId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, []);

  // Função para adicionar novo campo de recurso
  const addFeature = () => setFeatures([...features, ""]);
  // Função para atualizar recurso
  const updateFeature = (idx: number, value: string) => {
    setFeatures(features.map((f, i) => (i === idx ? value : f)));
  };

  // Máscara simples para moeda BRL
  const formatBRL = (value: string) => {
    const onlyNums = value.replace(/\D/g, "");
    const num = (parseInt(onlyNums, 10) / 100).toFixed(2);
    return Number.isNaN(Number(num))
      ? ""
      : Number(num).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL"
        });
  };

  const formSubmit = async () => {
    if (!userId) {
      setErrorMsg("Usuário não autenticado!");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    if (!serviceTitle.trim()) {
      setErrorMsg("Título do serviço é obrigatório!");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    if (!price.trim()) {
      setErrorMsg("Preço é obrigatório!");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    if (!label.trim()) {
      setErrorMsg("Observação é obrigatória!");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    if (features.some((f) => !f.trim())) {
      setErrorMsg("Todos os recursos do serviço são obrigatórios!");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    try {
      // Função para converter BRL formatado para string numérica (ex: "1234.56")
      const toNumericString = (str: string) => {
        if (!str) return "";
        return str
          .replace(/[^\d,.-]/g, "")
          .replace(/\./g, "")
          .replace(",", ".");
      };
      await postModalService({
        userId: userId,
        serviceTitle: serviceTitle,
        price: toNumericString(price),
        promoPrice: promoPrice ? toNumericString(promoPrice) : undefined,
        label: label,
        features: features.filter((f) => f.trim() !== "")
      });
      setServiceTitle("");
      setPrice("");
      setPromoPrice("");
      setLabel("Publicação comercial");
      setFeatures([""]);
      setSuccessMsg("Serviço cadastrado com sucesso!");
      setShowSuccess(true);
      setErrorMsg("");
      setShowError(false);

      setTimeout(() => setShowSuccess(false), 4000);
    } catch (err: any) {
      let msg = "Erro ao salvar serviço. ";
      if (err?.message)
        msg += "Tente novamente ou entre em contato com o suporte.";
      setSuccessMsg("");
      setErrorMsg(msg);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  return (
    <>
      {/* Mensagem de sucesso animada */}
      <div
        className={`fixed top-6 right-0 z-[999999] transition-transform duration-500 ${
          showSuccess ? "translate-x-0" : "translate-x-full"
        } bg-green-500 text-white px-6 py-3 rounded-l-lg shadow-lg flex items-center`}
        style={{ minWidth: 220 }}
      >
        {successMsg}
      </div>
      {/* Mensagem de erro animada */}
      <div
        className={`fixed top-20 right-0 z-[999999] transition-transform duration-500 ${
          showError ? "translate-x-0" : "translate-x-full"
        } bg-red-500 text-white px-6 py-3 rounded-l-lg shadow-lg flex items-center`}
        style={{ minWidth: 220 }}
      >
        {errorMsg}
      </div>

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
            className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md "
          >
            <h2 className="text-lg font-semibold mb-4">
              {field.modalTitle || "Novo Serviço"}
            </h2>
            <div className="space-y-4">
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
                <label className="block text-sm font-medium mb-1">Preço</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-black"
                  value={price}
                  onChange={(e) => setPrice(formatBRL(e.target.value))}
                  placeholder="R$ 0,00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Preço promocional
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-black"
                  value={promoPrice}
                  onChange={(e) => setPromoPrice(formatBRL(e.target.value))}
                  placeholder="R$ 0,00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Observação
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-black"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Recursos do serviço
                </label>
                {features.map((feature, idx) => (
                  <input
                    key={idx}
                    type="text"
                    className="w-full border rounded px-3 py-2 mb-2 text-black"
                    value={feature}
                    onChange={(e) => updateFeature(idx, e.target.value)}
                    placeholder={`Recurso ${idx + 1}`}
                    required
                  />
                ))}
                <button
                  type="button"
                  className="text-brand-500 hover:underline text-sm mt-1"
                  onClick={addFeature}
                >
                  + Adicionar recurso
                </button>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setServiceTitle("");
                    setPrice("");
                    setPromoPrice("");
                    setLabel("Publicação comercial");
                    setFeatures([""]);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={formSubmit as any}
                  className="px-4 py-2 bg-brand-500 text-white rounded hover:bg-brand-600 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
