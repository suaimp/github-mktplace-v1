import { useState } from "react";
import { createServiceCard } from "../../../context/db-context/services/serviceCardService";
import ToastMessage from "../../ui/ToastMessage/ToastMessage";
import { v4 as uuidv4 } from "uuid";

// Corrigir ButtonModalFieldProps para remover props não usadas
interface ButtonModalFieldProps {
  field: { label?: string; service_id: string };
}

export default function ButtonModalField({ field }: ButtonModalFieldProps) {
  const [serviceTitle, setServiceTitle] = useState("");
  const [pricePerWord, setPricePerWord] = useState<number | undefined>();
  const [wordCount, setWordCount] = useState<number | undefined>();
  const [subtitle, setSubtitle] = useState("");

  const [toasts, setToasts] = useState<
    {
      id: string;
      message: string;
      type: "success" | "error";
    }[]
  >([]);

  function addToast(message: string, type: "success" | "error") {
    const id = uuidv4();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }

  // Para benefícios (benefits)
  const [features, setFeatures] = useState<string[]>([""]);
  const addFeature = () => setFeatures([...features, ""]);
  const updateFeature = (idx: number, value: string) => {
    setFeatures(features.map((f, i) => (i === idx ? value : f)));
  };

  // Para recursos não inclusos (not_benefits)
  const [notBenefits, setNotBenefits] = useState<string[]>([""]);
  const addNotBenefit = () => setNotBenefits([...notBenefits, ""]);
  const updateNotBenefit = (idx: number, value: string) => {
    setNotBenefits(notBenefits.map((f, i) => (i === idx ? value : f)));
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
    if (
      !serviceTitle.trim() ||
      pricePerWord === undefined ||
      wordCount === undefined ||
      features.some((f) => !f.trim()) ||
      notBenefits.some((f) => !f.trim())
    ) {
      addToast("Preencha todos os campos obrigatórios.", "error");
      return;
    }
    const newCard = {
      service_id: field.service_id,
      title: serviceTitle,
      subtitle: subtitle || null,
      price: Number((pricePerWord * wordCount).toFixed(2)),
      benefits: features.filter((f) => f.trim() !== ""),
      not_benefits: notBenefits.filter((f) => f.trim() !== "")
    };
    const result = await createServiceCard(newCard);
    if (result) {
      addToast("Pacote criado com sucesso!", "success");
    } else {
      addToast("Erro ao criar pacote", "error");
    }
    setServiceTitle("");
    setSubtitle("");
    setPricePerWord(undefined);
    setWordCount(undefined);
    setFeatures([""]);
    setNotBenefits([""]);
  };

  return (
    <>
      <div
        className="top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-lg p-6 z-50 flex flex-col border-l border-gray-200 dark:border-gray-800"
        style={{ minWidth: 340 }}
      >
        <form
          className="flex-1 flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            formSubmit();
          }}
        >
          <h2 className="text-lg font-semibold mb-4">
            {field.label || "Novo Pacote"}
          </h2>
          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-sm font-medium mb-1">
                Título do pacote
              </label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 text-black"
                value={serviceTitle}
                onChange={(e) => setServiceTitle(e.target.value)}
                placeholder="Ex: Enterprise"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Subtítulo do pacote (opcional)
              </label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 text-black"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Ex: Ideal para empresas iniciantes"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Preço por palavra
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full border rounded px-3 py-2 text-black"
                value={pricePerWord ?? ""}
                onChange={(e) =>
                  setPricePerWord(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                placeholder="0,07"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Quantidade de palavras do pacote
              </label>
              <input
                type="number"
                min="1"
                className="w-full border rounded px-3 py-2 text-black"
                value={wordCount ?? ""}
                onChange={(e) =>
                  setWordCount(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                placeholder="600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Preço total
              </label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 text-black bg-gray-100 cursor-not-allowed"
                value={
                  pricePerWord !== undefined && wordCount !== undefined
                    ? formatBRL((pricePerWord * wordCount).toFixed(2))
                    : ""
                }
                readOnly
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Benefícios do pacote
              </label>
              <button
                type="button"
                className="text-brand-500 hover:underline text-sm mt-1 mb-2"
                onClick={addFeature}
              >
                + Adicionar benefício
              </button>
              {features.map((feature, idx) => (
                <input
                  key={idx}
                  type="text"
                  className="w-full border rounded px-3 py-2 mb-2 text-black"
                  value={feature}
                  onChange={(e) => updateFeature(idx, e.target.value)}
                  placeholder={`Benefício ${idx + 1}`}
                  required
                />
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Recursos NÃO inclusos no pacote
              </label>
              <button
                type="button"
                className="text-brand-500 hover:underline text-sm mt-1 mb-2"
                onClick={addNotBenefit}
              >
                + Adicionar recurso não incluso
              </button>
              {notBenefits.map((notBenefit, idx) => (
                <input
                  key={idx}
                  type="text"
                  className="w-full border rounded px-3 py-2 mb-2 text-black"
                  value={notBenefit}
                  onChange={(e) => updateNotBenefit(idx, e.target.value)}
                  placeholder={`Recurso não incluso ${idx + 1}`}
                  required
                />
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setServiceTitle("");
                  setSubtitle("");
                  setPricePerWord(undefined);
                  setWordCount(undefined);
                  setFeatures([""]);
                  setNotBenefits([""]);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
              >
                Limpar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-500 text-white rounded hover:bg-brand-600 transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </form>
        {toasts.map((toast, idx) => (
          <div
            className="  right-8"
            style={{ top: 90 + idx * 60, zIndex: 99999 }}
          >
            <ToastMessage
              key={toast.id}
              show={true}
              message={toast.message}
              type={toast.type}
              top={90 + idx * 60}
              onClose={() =>
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }
              className={`toast-anim-${toast.id}`}
            />
          </div>
        ))}
      </div>
    </>
  );
}
