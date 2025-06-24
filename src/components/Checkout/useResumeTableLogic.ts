import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getCartCheckoutResumeByUser } from "../../context/db-context/services/CartCheckoutResumeService";
import { getOrderTotalsByUser } from "../../context/db-context/services/OrderTotalsService";
import { useCheckoutCardsActions } from "../ServicePackages/cards/checkoutCardsActions";
import { useResumeTableEdit } from "./actions/ResumeTableEdit";
import { getSelectedServiceTitle } from "./utils/servicePackageSelectedUtils";
import {
  getSelectedNicheName,
  getNichePrice
} from "./utils/nicheSelectedUtils";
import { SERVICE_OPTIONS, NICHE_OPTIONS } from "./constants/options";

export function useResumeTableLogic() {
  const [resumeData, setResumeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<{ [id: string]: number }>({});
  const [selectedNiches, setSelectedNiches] = useState<{
    [id: string]: string;
  }>({});
  const [selectedService, setSelectedService] = useState<{
    [id: string]: string;
  }>({});
  const [wordCounts, setWordCounts] = useState<{ [id: string]: number | "" }>(
    {}
  );
  const { serviceCardsByActiveService, getActiveCards } =
    useCheckoutCardsActions();
  const {
    loadingItem,
    handleQuantityChange,
    handleQuantityBlur,
    handleNicheChange
  } = useResumeTableEdit();

  useEffect(() => {
    getActiveCards();
    async function fetchResume() {
      setLoading(true);
      setError(null);
      try {
        const {
          data: { user }
        } = await supabase.auth.getUser();
        if (!user) {
          setResumeData([]);
          setLoading(false);
          return;
        }
        const data = await getCartCheckoutResumeByUser(user.id);
        setResumeData(data || []);

        // Buscar dados existentes do order_totals para pressetar valores
        try {
          const orderTotals = await getOrderTotalsByUser(user.id);
          if (orderTotals && orderTotals.length > 0) {
            const latestTotal = orderTotals[0];
            console.log(
              "💾 useResumeTableLogic: Preset encontrado:",
              latestTotal
            );
            // Note: Os valores de wordCounts serão pressetados individualmente
            // pelos dados de service_selected de cada item no próximo useEffect
          }
        } catch (err) {
          console.warn(
            "⚠️ useResumeTableLogic: Erro ao buscar order_totals para preset:",
            err
          );
        }
      } catch (err: any) {
        setError("Erro ao buscar dados do resumo.");
        setResumeData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchResume();
    // Evento para recarregar via setService
    const handler = () => {
      fetchResume();
    };
    window.addEventListener("resume-table-reload", handler);
    return () => window.removeEventListener("resume-table-reload", handler);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Sempre sobrescreve os states ao recarregar resumeData
    setQuantities(() => {
      const updated: { [id: string]: number } = {};
      resumeData.forEach((item: any) => {
        updated[item.id] = item.quantity || 1;
      });
      return updated;
    });
    setSelectedNiches(() => {
      const updated: { [id: string]: string } = {};
      resumeData.forEach((item: any) => {
        let preset = item.niche_selected || "";
        if (Array.isArray(preset) && preset.length > 0 && preset[0].niche) {
          updated[item.id] = preset[0].niche;
        } else if (
          typeof preset === "object" &&
          preset !== null &&
          preset.niche
        ) {
          updated[item.id] = preset.niche;
        } else if (typeof preset === "string" && preset.trim() !== "") {
          try {
            const parsed = JSON.parse(preset);
            if (parsed && parsed.niche) {
              updated[item.id] = parsed.niche;
            } else {
              updated[item.id] = preset;
            }
          } catch {
            updated[item.id] = preset;
          }
        } else {
          // Valor padrão para nicho quando não há seleção prévia ou está vazio
          updated[item.id] = NICHE_OPTIONS.DEFAULT;
        }
      });
      return updated;
    });
    setSelectedService(() => {
      const updated: { [id: string]: string } = {};
      resumeData.forEach((item: any) => {
        let preset = item.service_selected || "";
        if (Array.isArray(preset) && preset.length > 0) {
          try {
            const first = preset[0];
            if (typeof first === "string") {
              const parsed = JSON.parse(first);
              if (parsed && parsed.title) {
                // Mapear os diferentes formatos para a opção do select
                if (
                  parsed.title === SERVICE_OPTIONS.LEGACY_NONE ||
                  parsed.title === SERVICE_OPTIONS.NONE
                ) {
                  updated[item.id] = SERVICE_OPTIONS.NONE;
                } else {
                  updated[item.id] = parsed.title;
                }
              } else {
                updated[item.id] = first;
              }
            } else if (
              typeof first === "object" &&
              first !== null &&
              first.title
            ) {
              // Mapear os diferentes formatos para a opção do select
              if (
                first.title === SERVICE_OPTIONS.LEGACY_NONE ||
                first.title === SERVICE_OPTIONS.NONE
              ) {
                updated[item.id] = SERVICE_OPTIONS.NONE;
              } else {
                updated[item.id] = first.title;
              }
            } else {
              // Valor padrão quando o array existe mas não tem dados válidos
              updated[item.id] = SERVICE_OPTIONS.NONE;
            }
          } catch {
            // Valor padrão em caso de erro no parse
            updated[item.id] = SERVICE_OPTIONS.NONE;
          }
        } else if (
          typeof preset === "object" &&
          preset !== null &&
          preset.title
        ) {
          // Mapear os diferentes formatos para a opção do select
          if (
            preset.title === SERVICE_OPTIONS.LEGACY_NONE ||
            preset.title === SERVICE_OPTIONS.NONE
          ) {
            updated[item.id] = SERVICE_OPTIONS.NONE;
          } else {
            updated[item.id] = preset.title;
          }
        } else if (typeof preset === "string" && preset.trim() !== "") {
          try {
            const parsed = JSON.parse(preset);
            if (parsed && parsed.title) {
              // Mapear os diferentes formatos para a opção do select
              if (
                parsed.title === SERVICE_OPTIONS.LEGACY_NONE ||
                parsed.title === SERVICE_OPTIONS.NONE
              ) {
                updated[item.id] = SERVICE_OPTIONS.NONE;
              } else {
                updated[item.id] = parsed.title;
              }
            } else {
              updated[item.id] = preset;
            }
          } catch {
            updated[item.id] = preset;
          }
        } else {
          // Valor padrão quando não há service_selected ou está vazio
          updated[item.id] = SERVICE_OPTIONS.NONE;
        }
      });
      return updated;
    });
    setWordCounts(() => {
      const updated: { [id: string]: number | "" } = {};
      resumeData.forEach((item: any) => {
        let preset = item.service_selected || "";
        if (
          Array.isArray(preset) &&
          preset.length > 0 &&
          (preset[0]?.word_count !== undefined || typeof preset[0] === "string")
        ) {
          if (typeof preset[0] === "string") {
            try {
              const parsed = JSON.parse(preset[0]);
              if (parsed && parsed.word_count !== undefined) {
                updated[item.id] = Number(parsed.word_count);
                return;
              }
            } catch {}
          } else if (
            typeof preset[0] === "object" &&
            preset[0]?.word_count !== undefined
          ) {
            updated[item.id] = Number(preset[0].word_count);
            return;
          }
        } else if (
          typeof preset === "object" &&
          preset !== null &&
          preset.word_count !== undefined
        ) {
          updated[item.id] = Number(preset.word_count);
          return;
        } else if (typeof preset === "string") {
          try {
            const parsed = JSON.parse(preset);
            if (parsed && parsed.word_count !== undefined) {
              updated[item.id] = Number(parsed.word_count);
              return;
            }
          } catch {}
        }
        updated[item.id] = "";
      });
      return updated;
    });
  }, [resumeData]);

  // Adiciona referência à função fetchResume para uso externo
  function fetchResumeData() {
    setLoading(true);
    setError(null);
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setResumeData([]);
        setLoading(false);
        return;
      }
      getCartCheckoutResumeByUser(user.id)
        .then((data) => setResumeData(data || []))
        .catch(() => {
          setError("Erro ao buscar dados do resumo.");
          setResumeData([]);
        })
        .finally(() => setLoading(false));
    });
  }

  // Effect adicional para salvar valores padrão no banco quando necessário
  useEffect(() => {
    if (resumeData.length > 0) {
      resumeData.forEach(async (item: any) => {
        let needsUpdate = false;
        const updates: any = {};

        // Verificar se precisa salvar nicho padrão
        if (
          !item.niche_selected ||
          (typeof item.niche_selected === "string" &&
            item.niche_selected.trim() === "") ||
          (Array.isArray(item.niche_selected) &&
            item.niche_selected.length === 0)
        ) {
          updates.niche_selected = [
            { niche: NICHE_OPTIONS.DEFAULT, price: "0" }
          ];
          needsUpdate = true;
        }

        // Verificar se precisa salvar serviço padrão
        if (
          !item.service_selected ||
          (typeof item.service_selected === "string" &&
            item.service_selected.trim() === "") ||
          (Array.isArray(item.service_selected) &&
            item.service_selected.length === 0)
        ) {
          updates.service_selected = [
            {
              title: SERVICE_OPTIONS.NONE,
              price_per_word: 0,
              word_count: 0,
              is_free: true,
              price: 0,
              benefits: []
            }
          ];
          needsUpdate = true;
        }

        // Salvar no banco se necessário
        if (needsUpdate) {
          try {
            const { updateCartCheckoutResume } = await import(
              "../../context/db-context/services/CartCheckoutResumeService"
            );
            await updateCartCheckoutResume(item.id, updates);
          } catch (error) {
            console.warn("Erro ao salvar valores padrão:", error);
          }
        }
      });
    }
  }, [resumeData]);

  return {
    resumeData,
    loading,
    error,
    quantities,
    setQuantities,
    selectedNiches,
    setSelectedNiches,
    selectedService,
    setSelectedService,
    wordCounts,
    setWordCounts,
    loadingItem,
    handleQuantityChange,
    handleQuantityBlur,
    handleNicheChange,
    serviceCardsByActiveService,
    getSelectedNicheName,
    getSelectedServiceTitle,
    getNichePrice,
    fetchResumeData // expõe função
  };
}
