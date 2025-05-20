import React, { useState } from "react";
import { postModalService } from "./services/ModalServicePost";

interface ButtonModalFieldProps {
  field: any;
  settings: any;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  onErrorClear?: () => void;
  publisherId: string; // Adicionado publisherId obrigatório
}

export default function ButtonModalField({
  field,
  settings,
  value,
  onChange,
  error,
  onErrorClear,
  publisherId // Recebe publisherId
}: ButtonModalFieldProps) {
  const [open, setOpen] = useState(false);
  const [serviceTitle, setServiceTitle] = useState("");
  const [price, setPrice] = useState("");
  const [promoPrice, setPromoPrice] = useState("");
  const [label, setLabel] = useState("Publicação comercial");
  const [features, setFeatures] = useState<string[]>([""]);

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

  const formSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      postModalService({
        publisherId: publisherId,
        serviceTitle: serviceTitle,
        price: price,
        promoPrice: promoPrice,
        label: label,
        features: features.filter((f) => f.trim() !== "")
      });
      setServiceTitle("");
      setPrice("");
      setPromoPrice("");
      setLabel("Publicação comercial");
      setFeatures([""]);
    } catch (err) {
      console.error("Erro ao salvar serviço:", err);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-brand-500 text-white rounded hover:bg-brand-600 transition-colors"
      >
        {field.label || "Abrir Modal"}
      </button>
      {open && (
        <div
          onMouseDown={() => setOpen(false)}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#000000] bg-opacity-50  dark:text-white"
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
