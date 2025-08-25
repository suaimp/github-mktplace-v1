import React, { useState, useEffect, useRef } from "react";
import { useCardColors } from "./cardColors";
import { setService } from "./actions/setService";

// Permite receber cardColors por props para customização dinâmica
interface ServiceCardProps {
  id: string;
  service_id: string;
  title: string;
  subtitle: string | null;
  price: number;
  benefits: string[];
  not_benefits: string[];
  period: string;
  created_at: string;
  updated_at: string;
  buttonText?: string;
  cardColors?: any; // CardColors opcional
  button?: boolean; // nova prop
  price_per_word?: number;
  word_count?: number;
  is_free?: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  service_id,
  title,
  price,
  period,
  subtitle,
  benefits,
  not_benefits,
  buttonText,
  cardColors: cardColorsProp,
  button = false,
  created_at,
  updated_at,
  price_per_word, // <-- ADICIONE AQUI
  word_count, // <-- ADICIONE AQUI
  is_free
}) => {
  // Estado para controlar se a lista está expandida
  const [isExpanded, setIsExpanded] = useState(false);
  // Estado para detectar se é mobile
  const [isMobile, setIsMobile] = useState(false);
  // Estado para detectar se o conteúdo está sendo cortado
  const [isContentOverflowing, setIsContentOverflowing] = useState(false);
  // Estado para controlar quantos itens cabem sem cortar
  const [visibleItemsCount, setVisibleItemsCount] = useState(3); // Inicia com 3 como padrão
  
  // Refs para medir o conteúdo
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detecta o tamanho da tela
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const allItems = [
    ...(benefits || []).map((text) => ({ text, type: "benefit" })),
    ...(not_benefits || []).map((text) => ({ text, type: "not_benefit" }))
  ];

  // Detecta se o conteúdo está sendo cortado
  useEffect(() => {
    const checkOverflow = () => {
      if (listRef.current && allItems.length > 0 && !isExpanded) {
        // Primeiro renderiza todos os itens para medir corretamente
        setVisibleItemsCount(allItems.length);
        
        // Aguarda o próximo frame para garantir que o DOM foi atualizado
        requestAnimationFrame(() => {
          if (listRef.current) {
            // Remove qualquer limitação de altura temporariamente para medir
            const originalMaxHeight = listRef.current.style.maxHeight;
            listRef.current.style.maxHeight = 'none';
            
            const fullHeight = listRef.current.scrollHeight;
            const maxAllowedHeight = isMobile ? 90 : 96; // Ajusta para mobile
            
            // Restaura a limitação original
            listRef.current.style.maxHeight = originalMaxHeight;
            
            const isOverflowing = fullHeight > maxAllowedHeight;
            setIsContentOverflowing(isOverflowing);
            
            if (isOverflowing) {
              // Calcula quantos itens cabem medindo item por item
              const listItems = listRef.current.querySelectorAll('li');
              let accumulatedHeight = 0;
              let itemsCount = 0;
              
              for (let i = 0; i < listItems.length; i++) {
                const itemHeight = listItems[i].offsetHeight;
                const spacingHeight = i > 0 ? 12 : 0; // space-y-3 = 12px entre itens
                const totalItemHeight = itemHeight + spacingHeight;
                
                if (accumulatedHeight + totalItemHeight <= maxAllowedHeight) {
                  accumulatedHeight += totalItemHeight;
                  itemsCount = i + 1;
                } else {
                  break;
                }
              }
              
              // Garante pelo menos 1 item visível
              const finalItemsCount = Math.max(1, itemsCount);
              setVisibleItemsCount(finalItemsCount);
              
              // Debug temporário
              console.log('Overflow detected:', {
                fullHeight,
                maxAllowedHeight,
                itemsCount: finalItemsCount,
                totalItems: allItems.length,
                isMobile,
                isExpanded
              });
            } else {
              // Se não há overflow, mostra todos
              setVisibleItemsCount(allItems.length);
            }
          }
        });
      } else if (isExpanded) {
        // Quando expandido, mostra todos e não há overflow
        setVisibleItemsCount(allItems.length);
        setIsContentOverflowing(false);
      }
    };

    // Verifica depois do render com mais tempo para estabilização
    const timeoutId = setTimeout(checkOverflow, 200);
    
    // Também verifica quando a janela é redimensionada
    const handleResize = () => {
      // Reset para recalcular
      setIsContentOverflowing(false);
      setVisibleItemsCount(allItems.length);
      setTimeout(checkOverflow, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [benefits, not_benefits, isExpanded, isMobile, allItems.length]);
  
  // Mostra todos os itens quando expandido, caso contrário mostra apenas os que cabem
  const itemsToShow = isExpanded ? allItems : allItems.slice(0, visibleItemsCount);

  // Hook de cores
  const [defaultColors] = useCardColors();
  const cardColors = cardColorsProp || defaultColors;

  return (
    <div
      className={`relative rounded-2xl border ${cardColors.border} ${cardColors.bg} p-6 ${cardColors.borderDark} ${cardColors.bgDark} xl:p-8 flex flex-col transition-all duration-300`}
      style={{ 
        height: isExpanded ? 'auto' : isMobile ? 325 : 350,
        minHeight: isMobile ? 325 : 350
      }}
    >
      <div className="flex items-start justify-between -mb-4">
        <span
          className={`block mb-3 font-semibold ${cardColors.title} ${cardColors.titleDark} text-base sm:text-lg xl:text-xl 2xl:text-xl`}
        >
          {title}
        </span>
      </div>
      <div className="flex items-end justify-between mb-1">
        <div className="flex items-center gap-1" style={{ gap: 5 }}>
          <h2
            className={`font-bold ${cardColors.price} text-title-md ${cardColors.priceDark} text-xl sm:text-2xl xl:text-3xl 2xl:text-4xl`}
            style={{ height: 'max-content', padding: 0 }}
          >
            {price.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL"
            })}
          </h2>
          <span
            className={`inline-block ${cardColors.period} ${cardColors.periodDark} text-xs sm:text-sm xl:text-sm 2xl:text-sm`}
          >
            /{period}
          </span>
        </div>
        {/* Exemplo de preço riscado, pode remover se não usar */}
        {/* <span className="font-semibold text-gray-400 line-through text-theme-xl">$59.00</span> */}
      </div>
      <p className={`${cardColors.benefit} ${cardColors.benefitDark} text-xs sm:text-sm xl:text-sm 2xl:text-sm`}>
        {subtitle}
      </p>
      <div
        className={`w-full h-px my-3 ${cardColors.divider} ${cardColors.dividerDark}`}
      ></div>
      <div 
        ref={containerRef}
        className={`${isExpanded ? 'flex-1' : ''} overflow-hidden`}
        style={{
          maxHeight: isExpanded ? 'none' : isMobile ? '90px' : '96px'
        }}
      >
        <ul 
          ref={listRef}
          className={`space-y-3 transition-all duration-300 overflow-hidden`}
        >
          {itemsToShow.map((item, idx) =>
            item.type === "benefit" ? (
              <li
                key={"b-" + idx}
                className={`flex items-center gap-3 ${cardColors.benefit} ${cardColors.benefitDark} text-xs sm:text-sm xl:text-sm 2xl:text-sm`}
              >
                <svg
                  width="1em"
                  height="1em"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-success-500"
                >
                  <path
                    d="M13.4017 4.35986L6.12166 11.6399L2.59833 8.11657"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {item.text}
              </li>
            ) : (
              <li
                key={"nb-" + idx}
                className={`flex items-center gap-3 ${cardColors.benefit} ${cardColors.benefitDark} text-xs sm:text-sm xl:text-sm 2xl:text-sm`}
              >
                <svg
                  width="1em"
                  height="1em"
                  viewBox="0 0 17 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={cardColors.notBenefit}
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4.05394 4.78033C3.76105 4.48744 3.76105 4.01256 4.05394 3.71967C4.34684 3.42678 4.82171 3.42678 5.1146 3.71967L8.33437 6.93944L11.5521 3.72173C11.845 3.42883 12.3199 3.42883 12.6127 3.72173C12.9056 4.01462 12.9056 4.48949 12.6127 4.78239L9.39503 8.0001L12.6127 11.2178C12.9056 11.5107 12.9056 11.9856 12.6127 12.2785C12.3198 12.5713 11.845 12.5713 11.5521 12.2785L8.33437 9.06076L5.11462 12.2805C4.82173 12.5734 4.34685 12.5734 4.05396 12.2805C3.76107 11.9876 3.76107 11.5127 4.05396 11.2199L7.27371 8.0001L4.05394 4.78033Z"
                    fill="currentColor"
                  />
                </svg>
                {item.text}
              </li>
            )
          )}
        </ul>
      </div>
      
      {(isContentOverflowing && !isExpanded) || isExpanded ? (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`mt-2 text-xs ${cardColors.benefit} ${cardColors.benefitDark} hover:opacity-80 transition-opacity flex items-center gap-1`}
        >
          {isExpanded ? 'Ver menos' : 'Ver mais'}
          <svg 
            className={`w-3 h-3 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      ) : null}
      
      <button
        className={`mt-auto w-full flex items-center justify-center rounded-lg ${cardColors.button} p-3.5 text-sm font-medium text-white shadow-theme-xs transition-colors ${cardColors.buttonHover} ${cardColors.buttonDark} ${cardColors.buttonDarkHover}`}
        onClick={
          button
            ? () => {
                setService({
                  id,
                  service_id,
                  title,
                  subtitle,
                  price,
                  benefits,
                  not_benefits,
                  period,
                  created_at,
                  updated_at,
                  price_per_word,
                  word_count,
                  is_free
                });
              }
            : undefined
        }
      >
        {buttonText}
      </button>
    </div>
  );
};

export default ServiceCard;
