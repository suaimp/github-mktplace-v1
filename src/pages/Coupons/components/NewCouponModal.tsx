import { useState } from "react";
 
/* components */
import Button from "../../../components/ui/button/Button";
 
import ToastContainer from "./toast/ToastContainer";
import { useToast } from "./toast/useToast";
/* types */
import { CreateCouponInput } from "../types";
/* context */
import { useCoupons } from "../context/CouponsContext";
/* services */
import { createCoupon } from "../../../services/db-services/coupons/couponService";

interface NewCouponModalProps {
  field: {
    label?: string;
    modalTitle?: string;
  };
}

export default function NewCouponModal({ field }: NewCouponModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateCouponInput>({
    code: "",
    name: "",
    description: "",
    discount_type: "percentage",
    discount_value: 0,
    minimum_amount: undefined,
    maximum_amount: undefined,
    maximum_discount: undefined,
    usage_limit: undefined,
    usage_limit_per_customer: undefined,
    start_date: "",
    end_date: "",
    is_active: true,
    individual_use_only: false,
    exclude_sale_items: false
  });
  
  const { toasts, addToast, removeToast } = useToast();
  
  const { fetchCoupons } = useCoupons();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : parseFloat(value)
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value || undefined
      }));
    }
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, code: result }));
  };

  const validateForm = (): boolean => {
    if (!formData.code.trim()) {
      addToast("Código é obrigatório", "error");
      return false;
    }
    
    if (!formData.name.trim()) {
      addToast("Nome é obrigatório", "error");
      return false;
    }
    
    if (formData.discount_value <= 0) {
      addToast("Valor do desconto deve ser maior que zero", "error");
      return false;
    }
    
    if (formData.discount_type === "percentage" && formData.discount_value > 100) {
      addToast("Desconto percentual não pode ser maior que 100%", "error");
      return false;
    }
    
    if (formData.maximum_amount && formData.minimum_amount && 
        formData.maximum_amount <= formData.minimum_amount) {
      addToast("Valor máximo deve ser maior que o valor mínimo", "error");
      return false;
    }
    
    if (formData.end_date && formData.start_date && 
        new Date(formData.end_date) <= new Date(formData.start_date)) {
      addToast("Data de fim deve ser posterior à data de início", "error");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const newCoupon = await createCoupon(formData);
      
      if (newCoupon) {
        addToast("Cupom criado com sucesso!", "success");
        
        // Reset form
        setFormData({
          code: "",
          name: "",
          description: "",
          discount_type: "percentage",
          discount_value: 0,
          minimum_amount: undefined,
          maximum_amount: undefined,
          maximum_discount: undefined,
          usage_limit: undefined,
          usage_limit_per_customer: undefined,
          start_date: "",
          end_date: "",
          is_active: true,
          individual_use_only: false,
          exclude_sale_items: false
        });
        
        fetchCoupons();
        setOpen(false);
      } else {
        addToast("Erro ao criar cupom", "error");
      }
    } catch (error) {
      console.error("Erro ao criar cupom:", error);
      addToast("Erro ao criar cupom", "error");
    }
  };

  // Função utilitária para formatar data para input datetime-local no horário local
  function getLocalDateTimeString(date: Date) {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return (
      date.getFullYear() +
      '-' +
      pad(date.getMonth() + 1) +
      '-' +
      pad(date.getDate()) +
      'T' +
      pad(date.getHours()) +
      ':' +
      pad(date.getMinutes())
    );
  }

  // Atualiza o valor mínimo para o campo de data/hora sempre que o componente renderiza
  const now = getLocalDateTimeString(new Date());

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <Button
        onClick={() => setOpen(true)}
        className="mb-4 bg-blue-600 hover:bg-blue-700 text-white"
      >
        {field.label || "Novo Cupom"}
      </Button>

      {open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-400/50 backdrop-blur-[--background-blur] dark:text-white">
          <div
            onClick={() => setOpen(false)}
            className="absolute inset-0"
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden z-10">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {field.modalTitle || "Adicionar Novo Cupom"}
              </h3>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informações Básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Código */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Código *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
                        placeholder="Ex: DESCONTO10"
                        required
                      />
                      <button
                        type="button"
                        onClick={generateCode}
                        className="bg-gray-500 hover:bg-gray-600 text-white text-xs px-3 py-2 rounded-md"
                      >
                        Gerar
                      </button>
                    </div>
                  </div>

                  {/* Nome */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
                      placeholder="Nome do cupom"
                      required
                    />
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descrição
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
                    rows={2}
                    placeholder="Descrição opcional"
                  />
                </div>

                {/* Configurações de Desconto */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="text-md font-medium text-gray-800 dark:text-white mb-4">Configurações de Desconto</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tipo de desconto */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tipo de Desconto *
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
                        Valor do Desconto * {formData.discount_type === "percentage" ? "(%)" : "(R$)"}
                      </label>
                      <input
                        type="number"
                        name="discount_value"
                        value={formData.discount_value}
                        onChange={handleInputChange}
                        min="0"
                        max={formData.discount_type === "percentage" ? "100" : undefined}
                        step={formData.discount_type === "percentage" ? "1" : "0.01"}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Limites e Valores */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="text-md font-medium text-gray-800 dark:text-white mb-4">Limites e Valores</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Valor mínimo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Valor Mínimo (R$)
                      </label>
                      <input
                        type="number"
                        name="minimum_amount"
                        value={formData.minimum_amount || ""}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
                        placeholder="Valor mínimo para usar o cupom"
                      />
                    </div>

                    {/* Valor máximo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Valor Máximo (R$)
                      </label>
                      <input
                        type="number"
                        name="maximum_amount"
                        value={formData.maximum_amount || ""}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
                        placeholder="Valor máximo do pedido para usar o cupom"
                      />
                    </div>

                    {/* Limite de uso */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Limite de Uso
                      </label>
                      <input
                        type="number"
                        name="usage_limit"
                        value={formData.usage_limit || ""}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
                        placeholder="Deixe vazio para uso ilimitado"
                      />
                    </div>

                    {/* Limite de uso por cliente */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Limite de Uso por Cliente
                      </label>
                      <input
                        type="number"
                        name="usage_limit_per_customer"
                        value={formData.usage_limit_per_customer || ""}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
                        placeholder="Quantas vezes cada cliente pode usar"
                      />
                    </div>
                  </div>
                </div>

                {/* Período de Validade */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="text-md font-medium text-gray-800 dark:text-white mb-4">Período de Validade</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Data de início */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Data de Início
                      </label>
                      <input
                        type="datetime-local"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                        min={now}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
                      />
                    </div>

                    {/* Data de fim */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Data de Expiração
                      </label>
                      <input
                        type="datetime-local"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleInputChange}
                        min={formData.start_date || now}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Configurações Avançadas */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="text-md font-medium text-gray-800 dark:text-white mb-4">Configurações Avançadas</h4>
                  
                  <div className="space-y-4">
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
                        checked={formData.individual_use_only}
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
                        checked={formData.exclude_sale_items}
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
                  </div>
                </div>

                {/* Botões */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex gap-3 justify-end">
                    <Button
                      onClick={() => setOpen(false)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700"
                    >
                      Cancelar
                    </Button>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center justify-center gap-2 rounded-lg transition px-5 py-3.5 text-sm"
                    >
                      Criar Cupom
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
