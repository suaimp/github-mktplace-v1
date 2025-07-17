import React, { useState, useEffect } from "react";
/* components */
import NewCouponModal from "./components/NewCouponModal";
import CouponsTable from "./components/CouponsTable";
/* types */
import { Coupon } from "./types";
/* context */
import { CouponsContext } from "./context/CouponsContext";
/* services */
import { 
  getCoupons, 
  deleteCoupon, 
  toggleCouponStatus 
} from "../../services/db-services/coupons/couponService";
import { updateCouponStatus } from "./utils/updateCouponStatus";

const Coupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para buscar cupons do backend
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await getCoupons();
      setCoupons(data);
    } catch (error) {
      console.error("Erro ao buscar cupons:", error);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDeleteCoupon = async (id: string) => {
    try {
      const success = await deleteCoupon(id);
      if (success) {
        setCoupons((prev) => prev.filter((coupon) => coupon.id !== id));
      } else {
        alert("Erro ao excluir cupom.");
      }
    } catch (error) {
      console.error("Erro ao excluir cupom:", error);
      alert("Erro ao excluir cupom.");
    }
  };

  const handleEditCoupon = (coupon: Coupon) => {
    // TODO: Implementar modal de edição
    console.log("Editando cupom:", coupon);
    alert("Funcionalidade de edição será implementada em breve.");
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const success = await toggleCouponStatus(id, isActive);
      if (success) {
        setCoupons((prev) => updateCouponStatus(prev, id, isActive));
      } else {
        alert("Erro ao alterar status do cupom.");
      }
    } catch (error) {
      console.error("Erro ao alterar status do cupom:", error);
      alert("Erro ao alterar status do cupom.");
    }
  };

  return (
    <CouponsContext.Provider value={{ fetchCoupons }}>
      <div>
        <h2
          className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90"
          x-text="pageName"
        >
          Cupons
        </h2>
        
        <NewCouponModal
          field={{
            label: "Novo Cupom",
            modalTitle: "Adicionar novo cupom"
          }}
        />
        
        <CouponsTable
          coupons={coupons}
          onDelete={handleDeleteCoupon}
          onEdit={handleEditCoupon}
          onToggleStatus={handleToggleStatus}
          onRefresh={fetchCoupons}
        />
        
        {loading && (
          <div className="fixed bottom-6 right-6 z-[9999] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg px-6 py-3 text-gray-500 dark:text-gray-200 animate-fade-in">
            Carregando...
          </div>
        )}
      </div>
    </CouponsContext.Provider>
  );
};

export default Coupons;
