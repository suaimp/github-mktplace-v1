import { useState, useEffect } from "react";
import {
  createServiceCard,
  getServiceCardById,
  updateServiceCard
} from "../../../context/db-context/services/serviceCardService";
import ToastMessage from "../../ui/ToastMessage/ToastMessage";
import { v4 as uuidv4 } from "uuid";
import Tooltip from "../../ui/Tooltip";

// Corrigir ButtonModalFieldProps para remover props não usadas
interface ButtonModalFieldProps {
  field: { label?: string; service_id: string; id?: string };
  onSuccess?: () => void;
}

export default function ButtonModalField({
  field,
  onSuccess
}: ButtonModalFieldProps) {
  const [serviceTitle, setServiceTitle] = useState("");
  const [pricePerWord, setPricePerWord] = useState<number | undefined>();
  const [wordCount, setWordCount] = useState<number | undefined>();
  const [subtitle, setSubtitle] = useState("");

  const [period, setPeriod] = useState<string>("");
  const [customPeriod, setCustomPeriod] = useState<string>("");

  const [toasts, setToasts] = useState<
    {
      id: string;
      message: string;
      type: "success" | "error";
    }[]
  >([]);

  const [isFreeWord, setIsFreeWord] = useState(false);

  function addToast(message: string, type: "success" | "error") {
    const id = uuidv4();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }

  // Para benefícios (benefits)
  const [features, setFeatures] = useState<string[]>([""]);
  const addFeature = () => {
    if (features.length + notBenefits.length < 6)
      setFeatures([...features, ""]);
  };
  const updateFeature = (idx: number, value: string) => {
    setFeatures(features.map((f, i) => (i === idx ? value : f)));
  };
  const removeFeature = (idx: number) => {
    if (features.length === 1) return;
    setFeatures(features.filter((_, i) => i !== idx));
  };

  // Para recursos não inclusos (not_benefits)
  const [notBenefits, setNotBenefits] = useState<string[]>([""]);
  const addNotBenefit = () => {
    if (features.length + notBenefits.length < 6)
      setNotBenefits([...notBenefits, ""]);
  };
  const updateNotBenefit = (idx: number, value: string) => {
    setNotBenefits(notBenefits.map((f, i) => (i === idx ? value : f)));
  };
  const removeNotBenefit = (idx: number) => {
    if (notBenefits.length === 1) return;
    setNotBenefits(notBenefits.filter((_, i) => i !== idx));
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

  useEffect(() => {
    async function fetchCard() {
      if (field.id) {
        const card = await getServiceCardById(field.id);
        if (card) {
          setServiceTitle(card.title);
          setSubtitle(card.subtitle || "");
          setPricePerWord(card.price_per_word ?? undefined);
          setWordCount(card.word_count ?? undefined);
          setFeatures(card.benefits.length ? card.benefits : [""]);
          setNotBenefits(card.not_benefits.length ? card.not_benefits : [""]);
          setPeriod(card.period);
          setCustomPeriod("");
          setIsFreeWord(!!card.is_free); // novo: carrega valor do banco
        }
      } else {
        setServiceTitle("");
        setSubtitle("");
        setPricePerWord(undefined);
        setWordCount(undefined);
        setFeatures([""]);
        setNotBenefits([""]);
        setPeriod("");
        setCustomPeriod("");
      }
    }
    fetchCard();
    // eslint-disable-next-line
  }, [field.id]);

  const formSubmit = async () => {
    if (
      !serviceTitle.trim() ||
      pricePerWord === undefined ||
      wordCount === undefined ||
      features.some((f) => !f.trim()) ||
      !(period === "custom" ? customPeriod.trim() : period)
    ) {
      addToast("Preencha todos os campos obrigatórios.", "error");
      return;
    }
    const newCard = {
      service_id: field.service_id,
      title: serviceTitle,
      subtitle: subtitle || null,
      price: isFreeWord ? 0 : Number((pricePerWord * wordCount).toFixed(2)),
      price_per_word: pricePerWord,
      word_count: wordCount,
      benefits: features.filter((f) => f.trim() !== ""),
      not_benefits: notBenefits.filter((f) => f.trim() !== ""),
      period: period === "custom" ? customPeriod : period,
      is_free: isFreeWord // novo campo para persistir o valor do checkbox
    };
    let result;
    if (field.id) {
      result = await updateServiceCard(field.id, newCard);
    } else {
      result = await createServiceCard(newCard);
    }
    if (result) {
      addToast(
        field.id
          ? "Pacote atualizado com sucesso!"
          : "Pacote criado com sucesso!",
        "success"
      );
      if (onSuccess) onSuccess(); // Chama sempre que houver sucesso
    } else {
      addToast(
        field.id ? "Erro ao atualizar pacote" : "Erro ao criar pacote",
        "error"
      );
    }
    setServiceTitle("");
    setSubtitle("");
    setPricePerWord(undefined);
    setWordCount(undefined);
    setFeatures([""]);
    setNotBenefits([""]);
    setPeriod("");
    setCustomPeriod("");
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
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white/90">
            {field.label || "Novo Pacote"}
          </h2>
          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                Título do pacote
              </label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 text-black dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                value={serviceTitle}
                onChange={(e) => setServiceTitle(e.target.value)}
                placeholder="Ex: Enterprise"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                Subtítulo do pacote (opcional)
              </label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 text-black dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Ex: Ideal para empresas iniciantes"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                Preço por palavra
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full border rounded px-3 py-2 text-black dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
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
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                Quantidade de palavras do pacote
              </label>
              <div className="flex items-center mb-1 gap-1 relative z-[9999999]">
                <input
                  type="checkbox"
                  id="free-word-checkbox"
                  checked={isFreeWord}
                  onChange={() => setIsFreeWord((prev) => !prev)}
                  className="accent-brand-500"
                />
                <label
                  htmlFor="free-word-checkbox"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer flex items-center gap-1 select-none"
                  style={{ userSelect: "none" }}
                >
                  Grátis
                </label>
                <Tooltip content="Selecione caso a quantidade de palavras digitadas nesse campo, sejam gratuitas. a contagem de valor ocorrerá quando o cliente solicitar um número maior de palavras.">
                  <span className="ml-0.5 text-xs text-brand-500 cursor-pointer align-middle select-none">
                    ?
                  </span>
                </Tooltip>
              </div>
              <input
                type="number"
                min="1"
                className="w-full border rounded px-3 py-2 text-black dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
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
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                Preço total
              </label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 text-black dark:text-white bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 cursor-not-allowed"
                value={
                  isFreeWord
                    ? formatBRL("0.00")
                    : pricePerWord !== undefined && wordCount !== undefined
                    ? formatBRL((pricePerWord * wordCount).toFixed(2))
                    : ""
                }
                readOnly
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                Benefícios do pacote
              </label>
              <button
                type="button"
                className={`text-brand-500 hover:underline text-sm mt-1 mb-2 ${
                  features.length + notBenefits.length >= 6
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={addFeature}
                disabled={features.length + notBenefits.length >= 6}
              >
                + Adicionar benefício
              </button>
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="relative flex items-center gap-2 mb-2"
                >
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2 text-black dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 pr-10"
                    value={feature}
                    onChange={(e) => updateFeature(idx, e.target.value)}
                    placeholder={`Benefício ${idx + 1}`}
                    required
                  />
                  {features.length > 1 && (
                    <button
                      type="button"
                      className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors hover:bg-red-200 dark:hover:bg-red-900 rounded-tr rounded-br p-0"
                      style={{
                        width: 35,
                        height: 35,
                        fontSize: 14,
                        lineHeight: 1
                      }}
                      onClick={() => removeFeature(idx)}
                      title="Remover benefício"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                Recursos NÃO inclusos no pacote (opcional)
              </label>
              <button
                type="button"
                className={`text-brand-500 hover:underline text-sm mt-1 mb-2 ${
                  features.length + notBenefits.length >= 6
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={addNotBenefit}
                disabled={features.length + notBenefits.length >= 6}
              >
                + Adicionar recurso não incluso
              </button>
              {notBenefits.map((notBenefit, idx) => (
                <div
                  key={idx}
                  className="relative flex items-center gap-2 mb-2"
                >
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2 text-black dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 pr-10"
                    value={notBenefit}
                    onChange={(e) => updateNotBenefit(idx, e.target.value)}
                    placeholder={`Recurso não incluso ${idx + 1}`}
                  />
                  {notBenefits.length > 1 && (
                    <button
                      type="button"
                      className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors hover:bg-red-200 dark:hover:bg-red-900 rounded-tr rounded-br p-0"
                      style={{
                        width: 35,
                        height: 35,
                        fontSize: 14,
                        lineHeight: 1
                      }}
                      onClick={() => removeNotBenefit(idx)}
                      title="Remover recurso não incluso"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                Período do pacote
              </label>
              <select
                className="w-full border rounded px-3 py-2 text-black dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 mb-2"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                required
              >
                <option value="">Selecione o período</option>
                <option value="por mês">Por mês</option>
                <option value="por ano">Por ano</option>

                <option value="custom">Outro (especificar)</option>
              </select>
              {period === "custom" && (
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-black dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 mt-2"
                  value={customPeriod}
                  onChange={(e) => setCustomPeriod(e.target.value)}
                  placeholder="Digite o período personalizado"
                  required
                />
              )}
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
                  setPeriod("");
                  setCustomPeriod("");
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
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
