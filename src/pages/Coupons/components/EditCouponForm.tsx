import { useState } from "react";
import ToastMessage from "../../../components/ui/ToastMessage/ToastMessage";
import { Coupon, UpdateCouponInput } from "../types";

interface EditCouponFormProps {
  initialCoupon: Coupon;
  onSubmit: (data: UpdateCouponInput) => Promise<void>;
  loading?: boolean;
}

export default function EditCouponForm({ initialCoupon, onSubmit, loading }: EditCouponFormProps) {
  const [formData, setFormData] = useState<UpdateCouponInput>({ ...initialCoupon });
  const [toasts, setToasts] = useState<{
    id: string;
    message: string;
    type: "success" | "error";
  }[]>([]);

  const addToast = (message: string, type: "success" | "error") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: value === "" ? undefined : parseFloat(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value || undefined }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.code?.trim()) {
      addToast("Código é obrigatório", "error");
      return false;
    }
    if (!formData.name?.trim()) {
      addToast("Nome é obrigatório", "error");
      return false;
    }
    if ((formData.discount_value ?? 0) <= 0) {
      addToast("Valor do desconto deve ser maior que zero", "error");
      return false;
    }
    if (formData.discount_type === "percentage" && (formData.discount_value ?? 0) > 100) {
      addToast("Desconto percentual não pode ser maior que 100%", "error");
      return false;
    }
    if (formData.maximum_amount && formData.minimum_amount && formData.maximum_amount <= formData.minimum_amount) {
      addToast("Valor máximo deve ser maior que o valor mínimo", "error");
      return false;
    }
    if (formData.end_date && formData.start_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
      addToast("Data de fim deve ser posterior à data de início", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSubmit(formData);
  };

  return (
    <>
      <div className="fixed top-4 right-4 z-[9999] space-y-2">
        {toasts.map((toast) => (
          <ToastMessage
            key={toast.id}
            message={toast.message}
            type={toast.type}
            show={true}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Código */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Código *
          </label>
          <input
            type="text"
            name="code"
            value={formData.code || ""}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
            required
          />
        </div>
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nome *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
            required
          />
        </div>
        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descrição
          </label>
          <textarea
            name="description"
            value={formData.description || ""}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
            rows={2}
          />
        </div>
        {/* Tipo de desconto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tipo de desconto
          </label>
          <select
            name="discount_type"
            value={formData.discount_type}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
          >
            <option value="percentage">Desconto em porcentagem</option>
            <option value="cart_fixed">Desconto fixo de carrinho</option>
            <option value="product_fixed">Desconto fixo de produto</option>
          </select>
        </div>
        {/* Valor do desconto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Valor do desconto *
          </label>
          <input
            type="number"
            name="discount_value"
            value={formData.discount_value ?? ""}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
            required
            min={0}
            step={0.01}
          />
        </div>
        {/* Limite mínimo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Valor mínimo para uso
          </label>
          <input
            type="number"
            name="minimum_amount"
            value={formData.minimum_amount ?? ""}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
            min={0}
            step={0.01}
          />
        </div>
        {/* Limite máximo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Desconto máximo permitido
          </label>
          <input
            type="number"
            name="maximum_discount"
            value={formData.maximum_discount ?? ""}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
            min={0}
            step={0.01}
          />
        </div>
        {/* Valor máximo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Valor máximo do pedido
          </label>
          <input
            type="number"
            name="maximum_amount"
            value={formData.maximum_amount ?? ""}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
            min={0}
            step={0.01}
          />
        </div>
        {/* Limite de uso */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Limite de uso
          </label>
          <input
            type="number"
            name="usage_limit"
            value={formData.usage_limit ?? ""}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
            min={0}
            step={1}
          />
        </div>
        {/* Limite de uso por cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Limite de uso por cliente
          </label>
          <input
            type="number"
            name="usage_limit_per_customer"
            value={formData.usage_limit_per_customer ?? ""}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
            min={0}
            step={1}
          />
        </div>
        {/* Datas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Data de Início
          </label>
          <input
            type="datetime-local"
            name="start_date"
            value={formData.start_date || ""}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Data de Expiração
          </label>
          <input
            type="datetime-local"
            name="end_date"
            value={formData.end_date || ""}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
          />
        </div>
        {/* Status ativo */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Cupom ativo
          </label>
        </div>
        {/* Apenas uso individual */}
        <div className="flex items-start">
          <input
            type="checkbox"
            name="individual_use_only"
            checked={formData.individual_use_only || false}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
          />
          <div className="ml-2">
            <label className="block text-sm text-gray-700 dark:text-gray-300 font-medium">
              Apenas uso individual
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Marque esta opção caso o cupom não possa ser utilizado juntamente com outros cupons.
            </p>
          </div>
        </div>
        {/* Excluir itens em oferta */}
        <div className="flex items-start">
          <input
            type="checkbox"
            name="exclude_sale_items"
            checked={formData.exclude_sale_items || false}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
          />
          <div className="ml-2">
            <label className="block text-sm text-gray-700 dark:text-gray-300 font-medium">
              Excluir itens em oferta
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Selecione esta opção caso o cupom não seja válido para produtos em promoção. Cupons aplicados por item funcionarão somente se o item não estiver em promoção. Cupons aplicados ao carrinho só serão válidos caso não haja produtos em promoção no carrinho.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-brand-500 text-white rounded hover:bg-brand-600 transition-colors"
            disabled={loading}
          >
            Salvar
          </button>
        </div>
      </form>
    </>
  );
} 