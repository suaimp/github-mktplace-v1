import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getCartCheckoutResumeByUser } from "../../services/db-services/marketplace-services/checkout/CartCheckoutResumeService";
import { getOrderTotalsByUser } from "../../services/db-services/marketplace-services/order/OrderTotalsService";
import { useCheckoutCardsActions } from "../ServicePackages/cards/checkoutCardsActions";
import { useResumeTableEdit } from "./actions/ResumeTableEdit";
import { getSelectedServiceTitle } from "./utils/servicePackageSelectedUtils";
import {
  getSelectedNicheName,
  getNichePrice
} from "./utils/nicheSelectedUtils";
import { SERVICE_OPTIONS } from "./constants/options";
import { useNicheState } from "./hooks/useNicheState";
import { NicheDbService } from "./services/NicheDbService";

export function useResumeTableLogic() {
  const [resumeData, setResumeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<{ [id: string]: number }>({});
  
  // Usar o novo hook para gerenciar nichos
  const { selectedNiches, initializeNiches, setSelectedNiches } = useNicheState();
  
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
    handleNicheChange,
    handleWordCountChange
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
        console.log("📥 Dados carregados do banco:", data);
        
        // Verifica e corrige dados malformados
        const sanitizedData = (data || []).map((item: any) => {
          console.log(`🔍 SANITIZING ITEM [${item.id}]:`, {
            originalServiceSelected: item.service_selected,
            type: typeof item.service_selected,
            isArray: Array.isArray(item.service_selected)
          });
          
          // Se service_selected é null ou undefined, deixa como null (não força valor padrão)
          if (item.service_selected === null || item.service_selected === undefined) {
            console.log(`✅ Item [${item.id}] has null/undefined service_selected, keeping as null`);
            item.service_selected = null;
            return item;
          }
          
          // Se é string, tenta fazer parse
          if (typeof item.service_selected === "string") {
            try {
              const parsed = JSON.parse(item.service_selected);
              item.service_selected = Array.isArray(parsed) ? parsed : [parsed];
              console.log(`✅ Item [${item.id}] parsed string to array:`, item.service_selected);
            } catch {
              console.warn(`⚠️ Item [${item.id}] has malformed service_selected string, setting to null:`, item.service_selected);
              // NÃO criar valor padrão, deixar como null para forçar seleção
              item.service_selected = null;
            }
            return item;
          }
          
          // Se não é array, mas é objeto válido, transforma em array
          if (typeof item.service_selected === "object" && !Array.isArray(item.service_selected)) {
            console.log(`✅ Item [${item.id}] converting object to array:`, item.service_selected);
            item.service_selected = [item.service_selected];
            return item;
          }
          
          // Se já é array, mantém como está
          if (Array.isArray(item.service_selected)) {
            console.log(`✅ Item [${item.id}] already array, keeping:`, item.service_selected);
            return item;
          }
          
          // Para qualquer outro caso inesperado, deixa null
          console.warn(`⚠️ Item [${item.id}] unexpected service_selected type, setting to null:`, item.service_selected);
          item.service_selected = null;
          return item;
        });
        
        console.log("🧹 Dados sanitizados:", sanitizedData);
        setResumeData(sanitizedData);

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
    // Recarregando estados com resumeData
    console.log("🔄 Recarregando estados com resumeData:", resumeData);
    
    setQuantities(() => {
      const updated: { [id: string]: number } = {};
      resumeData.forEach((item: any) => {
        updated[item.id] = item.quantity || 1;
      });
      return updated;
    });

    // Usar o novo serviço para inicializar nichos corretamente
    initializeNiches(resumeData);
    setSelectedService(() => {
      const updated: { [id: string]: string } = {};
      resumeData.forEach((item: any) => {
        // Debug: log do que está vindo do banco
        console.log('🔍 [DEBUG] Item do banco:', {
          id: item.id,
          product_url: item.product_url,
          service_selected: item.service_selected,
          service_selected_type: typeof item.service_selected,
          service_selected_value: JSON.stringify(item.service_selected)
        });
        
        let preset = item.service_selected || "";
        
        // Só inicializar se realmente existe um valor válido no banco
        if (!preset || 
            preset === "" || 
            preset === null || 
            preset === undefined ||
            (Array.isArray(preset) && preset.length === 0)) {
          console.log('🚫 [DEBUG] Item sem service_selected válido, não inicializando:', item.id);
          return; // Não setar nada, deixar o placeholder aparecer
        }
        
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
                  // SEMPRE inicializar com SERVICE_OPTIONS.NONE se existe no banco
                  // Isso permite que seleções anteriores sejam mantidas após reload
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
                // SEMPRE inicializar com SERVICE_OPTIONS.NONE se existe no banco
                // Isso permite que seleções anteriores sejam mantidas após reload
                updated[item.id] = SERVICE_OPTIONS.NONE;
              } else {
                updated[item.id] = first.title;
              }
            }
            // Removido: não definir valor padrão quando array existe mas não tem dados válidos
          } catch {
            // Removido: não definir valor padrão em caso de erro no parse
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
            // SEMPRE inicializar com SERVICE_OPTIONS.NONE se existe no banco
            // Isso permite que seleções anteriores sejam mantidas após reload
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
                // SEMPRE inicializar com SERVICE_OPTIONS.NONE se existe no banco
                // Isso permite que seleções anteriores sejam mantidas após reload
                updated[item.id] = SERVICE_OPTIONS.NONE;
              } else {
                updated[item.id] = parsed.title;
              }
            } else {
              // Se preset é diretamente SERVICE_OPTIONS.NONE ou LEGACY_NONE, setar
              if (preset === SERVICE_OPTIONS.NONE || preset === SERVICE_OPTIONS.LEGACY_NONE) {
                updated[item.id] = SERVICE_OPTIONS.NONE;
              } else {
                updated[item.id] = preset;
              }
            }
          } catch {
            // Se preset é diretamente SERVICE_OPTIONS.NONE ou LEGACY_NONE, setar
            if (preset === SERVICE_OPTIONS.NONE || preset === SERVICE_OPTIONS.LEGACY_NONE) {
              updated[item.id] = SERVICE_OPTIONS.NONE;
            } else {
              updated[item.id] = preset;
            }
          }
        }
        // Removido: não definir valor padrão quando não há service_selected ou está vazio
        // Isso fará com que itens sem service_selected não tenham valor definido,
        // forçando o uso do placeholder
      });
      return updated;
    });
    setWordCounts(() => {
      const updated: { [id: string]: number | "" } = {};
      resumeData.forEach((item: any) => {
        console.log("🔄 Carregando wordCounts para item:", {
          itemId: item.id,
          serviceSelected: item.service_selected,
          serviceSelectedType: typeof item.service_selected,
          isArray: Array.isArray(item.service_selected)
        });
        
        let preset = item.service_selected || "";
        let wordCountFound = false;
        
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
                console.log("✅ WordCount carregado de string JSON:", Number(parsed.word_count));
                wordCountFound = true;
              }
            } catch {}
          } else if (
            typeof preset[0] === "object" &&
            preset[0]?.word_count !== undefined
          ) {
            updated[item.id] = Number(preset[0].word_count);
            console.log("✅ WordCount carregado de objeto:", Number(preset[0].word_count));
            wordCountFound = true;
          }
        } else if (
          typeof preset === "object" &&
          preset !== null &&
          preset.word_count !== undefined
        ) {
          updated[item.id] = Number(preset.word_count);
          console.log("✅ WordCount carregado de objeto direto:", Number(preset.word_count));
          wordCountFound = true;
        } else if (typeof preset === "string") {
          try {
            const parsed = JSON.parse(preset);
            if (parsed && parsed.word_count !== undefined) {
              updated[item.id] = Number(parsed.word_count);
              console.log("✅ WordCount carregado de string direto:", Number(parsed.word_count));
              wordCountFound = true;
            }
          } catch {}
        }
        
        if (!wordCountFound) {
          updated[item.id] = "";
          console.log("❌ WordCount não encontrado, usando valor vazio");
        }
      });
      console.log("📊 WordCounts carregados:", updated);
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

  // Effect para inicializar valores padrão no banco quando necessário
  useEffect(() => {
    if (resumeData.length > 0) {
      // Usar o novo serviço para inicializar nichos faltantes no banco
      NicheDbService.initializeMissingNiches(resumeData).catch(error => {
        console.warn("Erro ao inicializar nichos no banco:", error);
      });

      // Manter lógica original para serviços
      resumeData.forEach(async (item: any) => {
        let needsUpdate = false;
        const updates: any = {};

        // REMOVIDO: Não inicializar automaticamente com SERVICE_OPTIONS.NONE
        // Deixar o campo vazio para forçar o usuário a selecionar
        // if (
        //   !item.service_selected ||
        //   (typeof item.service_selected === "string" &&
        //     item.service_selected.trim() === "") ||
        //   (Array.isArray(item.service_selected) &&
        //     item.service_selected.length === 0)
        // ) {
        //   updates.service_selected = [
        //     {
        //       title: SERVICE_OPTIONS.NONE,
        //       price_per_word: 0,
        //       word_count: 0,
        //       is_free: true,
        //       price: 0,
        //       benefits: []
        //     }
        //   ];
        //   needsUpdate = true;
        // }

        // Salvar no banco se necessário
        if (needsUpdate) {
          try {
            const { updateCartCheckoutResume } = await import(
              "../../services/db-services/marketplace-services/checkout/CartCheckoutResumeService"
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
    handleWordCountChange,
    serviceCardsByActiveService,
    getSelectedNicheName,
    getSelectedServiceTitle,
    getNichePrice,
    fetchResumeData // expõe função
  };
}
