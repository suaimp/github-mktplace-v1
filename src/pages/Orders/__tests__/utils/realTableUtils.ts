/**
 * Utilitários de teste para simular o comportamento REAL da OrderItemsTable
 * Baseado na lógica real implementada em /orders/:id
 */

// Interface real do OrderItem conforme usado na OrderItemsTable
interface RealOrderItem {
  id: string;
  product_name: string;
  product_url: string;
  quantity: number;
  total_price: number;
  article_document_path?: string;
  article_doc?: string;
  article_url?: string;
  publication_status?: string;
  service_content?: any;
  outline?: any;
}

/**
 * Simula a lógica real do OrderItemAnalyzer.hasPackageSelected()
 * Um item TEM pacote apenas se service_content possui benefits não vazios
 */
export const hasPackageSelected = (item: RealOrderItem): boolean => {
  try {
    let serviceData: any = null;
    
    if (Array.isArray(item.service_content) && item.service_content.length > 0) {
      const jsonString = item.service_content[0];
      if (typeof jsonString === "string") {
        serviceData = JSON.parse(jsonString);
      } else if (typeof jsonString === "object") {
        serviceData = jsonString;
      }
    } else if (typeof item.service_content === "string") {
      serviceData = JSON.parse(item.service_content);
    } else if (typeof item.service_content === "object") {
      serviceData = item.service_content;
    }

    // A CHAVE: só tem pacote se há benefits reais (não vazios)
    return serviceData && serviceData.benefits && serviceData.benefits.length > 0;
  } catch (e) {
    return false;
  }
};

/**
 * Simula a lógica real do OrderItemAnalyzer.hasOutlineData()
 */
export const hasOutlineData = (item: RealOrderItem): boolean => {
  return !!(item.outline && typeof item.outline === 'object' && Object.keys(item.outline).length > 0);
};

/**
 * Simula como a coluna "Pacote de Conteúdo" é renderizada na tabela real
 */
export const getPackageColumnDisplay = (item: RealOrderItem): string => {
  try {
    let serviceData: any = null;
    
    if (Array.isArray(item.service_content) && item.service_content.length > 0) {
      const jsonString = item.service_content[0];
      if (typeof jsonString === "string") {
        serviceData = JSON.parse(jsonString);
      } else if (typeof jsonString === "object") {
        serviceData = jsonString;
      }
    } else if (typeof item.service_content === "string") {
      serviceData = JSON.parse(item.service_content);
    } else if (typeof item.service_content === "object") {
      serviceData = item.service_content;
    }

    if (!serviceData) {
      return "Dados do pacote indisponíveis";
    }

    // Retorna o título do service_content (pode ser "nenhum" ou nome do pacote)
    return serviceData?.title || "Pacote sem título";
  } catch (e) {
    return "Erro no formato do pacote";
  }
};

/**
 * Simula como a coluna "Artigo DOC" é renderizada na tabela real
 * ESTA É A LÓGICA PRINCIPAL que você queria testar!
 */
export const getArticleDocColumnDisplay = (item: RealOrderItem, isAdmin: boolean): string => {
  // Se já tem arquivo enviado, mostra "Artigo"
  if (item.article_document_path || 
      (typeof item.article_doc === 'string' && item.article_doc.trim() !== '')) {
    return "Artigo";
  }

  // Caso não tenha nada, determinar o botão
  const hasPackage = hasPackageSelected(item);
  const hasOutline = hasOutlineData(item);
  
  if (hasPackage && hasOutline && !isAdmin) {
    // Se tem pauta, usuário não-admin vê "Pauta enviada"
    return "Pauta enviada";
  }
  
  if (hasPackage && !hasOutline) {
    // Se tem pacote mas não tem pauta, mostrar "Enviar Pauta"
    return "Enviar Pauta";
  } else if (hasPackage && hasOutline && isAdmin) {
    // Se tem pacote e pauta, admin vê "Enviar Artigo"
    return "Enviar Artigo";
  }
  
  // SE NÃO TEM PACOTE (nosso caso de teste): "Enviar Pauta"
  return "Enviar Pauta";
};

/**
 * Simula como a coluna "URL do Artigo" é renderizada
 */
export const getArticleUrlColumnDisplay = (item: RealOrderItem): string => {
  if (item.article_url && item.article_url.trim().length > 0) {
    return "Abrir url";
  }
  return "Aguardando publicação";
};

/**
 * Simula como a coluna "STATUS" é renderizada
 */
export const getStatusColumnDisplay = (item: RealOrderItem): string => {
  switch (item.publication_status) {
    case "approved":
      return "Aprovado";
    case "rejected":
      return "Rejeitado";
    case "published":
      return "Publicado";
    case "pending":
    default:
      return "Aguardando";
  }
};

/**
 * Verifica se um item está no fluxo "sem pacote selecionado"
 * (quando cliente escolheu "nenhum" ou não selecionou nada)
 */
export const isInNoPackageFlow = (item: RealOrderItem): boolean => {
  return !hasPackageSelected(item);
};

/**
 * Dados de teste simulando a tabela real
 */
export const simulateTableRowData = (item: RealOrderItem, isAdmin: boolean = false) => {
  return {
    id: item.id,
    produto: item.product_name,
    pacoteDeConteudo: getPackageColumnDisplay(item),
    artigoDoc: getArticleDocColumnDisplay(item, isAdmin),
    urlDoArtigo: getArticleUrlColumnDisplay(item),
    status: getStatusColumnDisplay(item),
    isInNoPackageFlow: isInNoPackageFlow(item),
    hasPackage: hasPackageSelected(item),
    hasOutline: hasOutlineData(item)
  };
};
