import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EditCouponForm from "./components/EditCouponForm";
import { Coupon, UpdateCouponInput } from "./types";
import { getCouponById, updateCoupon } from "../../services/db-services/coupons/couponService";
import { useCouponSticky } from "./hooks/useCouponSticky";
import ToastContainer from "./components/toast/ToastContainer";
import { useToast } from "./components/toast/useToast";

const TicketEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const sticky = useCouponSticky({ offsetTop: 20, onlyOnDesktop: true });
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getCouponById(id)
      .then((data) => setCoupon(data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data: UpdateCouponInput) => {
    setSaving(true);
    try {
      const result = await updateCoupon({ ...data, id: id! });
      if (result) {
        addToast("Cupom atualizado com sucesso!", "success");
        // Buscar o cupom atualizado e atualizar o estado local
        const updated = await getCouponById(id!);
        setCoupon(updated);
      } else {
        addToast("Erro ao atualizar cupom.", "error");
      }
    } catch (e) {
      addToast("Erro inesperado ao atualizar cupom.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600 dark:text-gray-300">Carregando...</div>
      </div>
    );
  }
  if (!coupon) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">Cupom não encontrado.</div>
      </div>
    );
  }

  return (
    <div className="w-full main-content p-4 mx-auto max-w-[--breakpoint-2xl] md:p-6 overflow-hidden">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <section className="flex min-h-screen">
        {/* Esquerda */}
        <div className="flex-1 pr-0 md:pr-4 lg:pr-8 xl:pr-12 2xl:pr-16 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">Editar Cupom</h2>
            <button
              type="button"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors text-sm font-medium"
              onClick={() => navigate(-1)}
            >
              <svg
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 18 18"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.25 15L5.25 9L11.25 3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Voltar
            </button>
          </div>
          {/* Sticky placeholder */}
          <div ref={sticky.placeholderRef} style={sticky.placeholderStyle} />
          {/* Sticky bloco */}
          <div
            ref={sticky.ref}
            style={sticky.style}
            className="border border-gray-200 dark:border-white/[0.05] rounded-xl bg-white dark:bg-gray-900 p-6 mb-6"
          >
            <div className="mb-4">
              <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Nome</span>
              <span className="text-lg font-semibold text-gray-800 dark:text-white">{coupon.name}</span>
            </div>
            <div className="mb-4">
              <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Código</span>
              <span className="font-mono text-base text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded px-2 py-1">{coupon.code}</span>
            </div>
            {coupon.description && (
              <div>
                <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Descrição</span>
                <span className="text-gray-700 dark:text-gray-200">{coupon.description}</span>
              </div>
            )}
          </div>
        </div>
        {/* Direita */}
        <div className="top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 p-6 z-50 flex flex-col border-l border-gray-200 dark:border-gray-800 border border-gray-200 dark:border-white/[0.05]" style={{ minWidth: 340 }}>
          <EditCouponForm initialCoupon={coupon} onSubmit={handleSubmit} loading={saving} />
        </div>
      </section>
    </div>
  );
};

export default TicketEditPage; 