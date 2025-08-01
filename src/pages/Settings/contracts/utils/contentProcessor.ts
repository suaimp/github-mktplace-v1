/**
 * Utilitários para processar conteúdo colado do Google Docs
 * Detecta títulos, listas e formata automaticamente
 */

export interface ProcessedContent {
  html: string;
  plainText: string;
}

/**
 * Processa conteúdo colado detectando títulos e listas automaticamente
 */
export class ContentProcessor {
  /**
   * Processa texto colado e converte em HTML formatado
   */
  static processClipboardContent(clipboardData: DataTransfer): ProcessedContent {
    try {
      console.log('📋 Iniciando processamento do clipboard...');
      
      // Tenta obter HTML primeiro (mais rico em informações)
      const htmlContent = clipboardData.getData('text/html');
      const plainTextContent = clipboardData.getData('text/plain');

      console.log('📄 Dados do clipboard:', {
        hasHTML: !!htmlContent,
        hasPlainText: !!plainTextContent,
        htmlLength: htmlContent?.length || 0,
        plainTextLength: plainTextContent?.length || 0
      });

      if (htmlContent && htmlContent.trim().length > 0) {
        console.log('🔄 Processando conteúdo HTML...');
        return this.processHTMLContent(htmlContent, plainTextContent);
      } else if (plainTextContent && plainTextContent.trim().length > 0) {
        console.log('🔄 Processando conteúdo de texto simples...');
        return this.processPlainTextContent(plainTextContent);
      } else {
        console.warn('⚠️ Nenhum conteúdo válido encontrado no clipboard');
        return {
          html: '',
          plainText: ''
        };
      }
    } catch (error) {
      console.error('❌ Erro no processamento do clipboard:', error);
      return {
        html: '',
        plainText: ''
      };
    }
  }

  /**
   * Processa conteúdo HTML do Google Docs
   */
  private static processHTMLContent(html: string, fallbackText: string): ProcessedContent {
    try {
      console.log('🔍 HTML original recebido:', html.substring(0, 500) + '...');
      
      // Criar um elemento temporário para processar o HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      console.log('📝 HTML após parse inicial:', tempDiv.innerHTML.substring(0, 500) + '...');

      // Processar títulos do Google Docs
      this.processGoogleDocsHeadings(tempDiv);
      
      // Processar formatação (negrito, cores, etc.)
      this.processFormatting(tempDiv);
      
      console.log('💅 HTML após processamento de formatação:', tempDiv.innerHTML.substring(0, 500) + '...');
      
      // Processar listas
      this.processLists(tempDiv);
      
      // Processar parágrafos
      this.processParagraphs(tempDiv);
      
      // Limpar HTML desnecessário mantendo a estrutura
      this.cleanHTML(tempDiv);

      const processedHTML = tempDiv.innerHTML;
      const plainText = this.htmlToPlainText(processedHTML);

      console.log('✅ HTML final processado:', processedHTML.substring(0, 500) + '...');

      // Se o processamento resultou em conteúdo vazio, usar fallback
      if (!processedHTML.trim() && fallbackText.trim()) {
        console.log('⚠️ Processamento resultou vazio, usando texto simples');
        return this.processPlainTextContent(fallbackText);
      }

      return {
        html: processedHTML,
        plainText: plainText || fallbackText
      };
    } catch (error) {
      console.error('❌ Erro ao processar HTML:', error);
      console.log('🔄 Tentando processar como texto simples...');
      return this.processPlainTextContent(fallbackText);
    }
  }

  /**
   * Processa títulos específicos do Google Docs
   */
  private static processGoogleDocsHeadings(container: HTMLElement) {
    // Google Docs usa spans com classes específicas para títulos
    const elements = container.querySelectorAll('*');
    
    elements.forEach(element => {
      const style = element.getAttribute('style') || '';
      const className = element.className || '';
      
      // Detectar títulos baseado no estilo e tamanho da fonte
      if (this.isHeading(element, style, className)) {
        const headingLevel = this.getHeadingLevel(element, style);
        const headingTag = `h${headingLevel}`;
        
        // Criar novo elemento de título
        const heading = document.createElement(headingTag);
        heading.textContent = element.textContent || '';
        heading.className = this.getHeadingClasses(headingLevel);
        
        // Substituir o elemento original
        element.replaceWith(heading);
      }
    });
  }

  /**
   * Determina se um elemento é um título
   */
  private static isHeading(element: Element, style: string, className: string): boolean {
    const text = element.textContent?.trim() || '';
    
    // Verificar se é muito curto ou muito longo para ser título
    if (text.length < 2 || text.length > 200) return false;
    
    // Verificar indicadores de título no estilo
    const hasLargeFont = /font-size:\s*([1-9][0-9]|[2-9][0-9]\.?)pt/.test(style);
    const hasBoldFont = /font-weight:\s*(bold|[6-9]00)/.test(style) || /font-weight:\s*bold/.test(style);
    const hasHeadingClass = /heading|title|h[1-6]/i.test(className);
    
    // Verificar se parece com título (maiúscula, sem pontuação final, etc.)
    const looksLikeTitle = /^[A-ZÀ-Ÿ]/.test(text) && !/[.!?]$/.test(text);
    const isShortLine = text.length < 100;
    
    return (hasLargeFont || hasBoldFont || hasHeadingClass) && looksLikeTitle && isShortLine;
  }

  /**
   * Determina o nível do título baseado no tamanho da fonte
   */
  private static getHeadingLevel(element: Element, style: string): number {
    const fontSizeMatch = style.match(/font-size:\s*(\d+(?:\.\d+)?)pt/);
    
    if (fontSizeMatch) {
      const fontSize = parseFloat(fontSizeMatch[1]);
      
      // Mapear tamanhos de fonte para níveis de título
      if (fontSize >= 20) return 1;
      if (fontSize >= 18) return 2;
      if (fontSize >= 16) return 3;
      if (fontSize >= 14) return 4;
      if (fontSize >= 12) return 5;
      return 6;
    }
    
    // Fallback baseado na posição e contexto
    const text = element.textContent?.trim() || '';
    if (text.length < 30) return 2;
    if (text.length < 50) return 3;
    return 4;
  }

  /**
   * Processa formatação como negrito, cores, itálico
   */
  private static processFormatting(container: HTMLElement) {
    try {
      console.log('🎨 Iniciando processamento de formatação...');
      
      // Primeiro: processar elementos com estilos inline ANTES de processar tags existentes
      const styledElements = container.querySelectorAll('*[style]');
      console.log(`🎯 Encontrados ${styledElements.length} elementos com estilo inline`);
      
      styledElements.forEach(element => {
        const style = element.getAttribute('style') || '';
        const tagName = element.tagName.toLowerCase();
        
        // Pular se já é um elemento de formatação
        if (['b', 'strong', 'i', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
          return;
        }
        
        console.log('🔍 Analisando elemento:', {
          tag: tagName,
          style: style,
          text: element.textContent?.substring(0, 50),
          isBold: this.isBoldFromStyle(style),
          isItalic: this.isItalicFromStyle(style)
        });
        
        // Processar negrito
        if (this.isBoldFromStyle(style) && !this.hasStrongParent(element)) {
          console.log('💪 Convertendo elemento para negrito:', element.textContent?.substring(0, 50));
          this.wrapWithFormatting(element, 'strong', 'font-bold');
        }
        
        // Processar itálico
        else if (this.isItalicFromStyle(style) && !this.hasEmphasisParent(element)) {
          console.log('📝 Convertendo elemento para itálico:', element.textContent?.substring(0, 50));
          this.wrapWithFormatting(element, 'em', 'italic');
        }
      });
      
      // Segundo: processar elementos existentes de formatação
      const existingFormatting = container.querySelectorAll('b, strong, i, em');
      console.log(`📝 Encontrados ${existingFormatting.length} elementos de formatação existentes`);
      
      existingFormatting.forEach(element => {
        const tagName = element.tagName.toLowerCase();
        if (['b', 'strong'].includes(tagName)) {
          element.className = this.addClassToElement(element.className, 'font-bold');
        } else if (['i', 'em'].includes(tagName)) {
          element.className = this.addClassToElement(element.className, 'italic');
        }
      });
      
      // Terceiro: processar cores em todos os elementos
      const allElements = container.querySelectorAll('*');
      allElements.forEach(element => {
        const style = element.getAttribute('style') || '';
        const computedClasses: string[] = [];
        
        // Processar cores
        const textColor = this.extractTextColor(style);
        if (textColor) {
          computedClasses.push(textColor);
        }
        
        const backgroundColor = this.extractBackgroundColor(style);
        if (backgroundColor) {
          computedClasses.push(backgroundColor);
        }
        
        // Aplicar classes de cor
        if (computedClasses.length > 0) {
          const existingClasses = element.className ? element.className.split(' ') : [];
          const newClasses = [...existingClasses, ...computedClasses].filter(Boolean).join(' ');
          element.className = newClasses;
        }
      });
      
      console.log('✅ Processamento de formatação concluído');
    } catch (error) {
      console.error('❌ Erro no processamento de formatação:', error);
    }
  }

  /**
   * Envolve um elemento com formatação específica
   */
  private static wrapWithFormatting(element: Element, tagName: string, className: string) {
    try {
      const wrapper = document.createElement(tagName);
      wrapper.className = className;
      
      // Mover todo o conteúdo para o wrapper
      wrapper.innerHTML = element.innerHTML;
      
      // Substituir o elemento original
      element.replaceWith(wrapper);
    } catch (error) {
      console.error('Erro ao envolver elemento com formatação:', error);
    }
  }

  /**
   * Verifica se o elemento tem um pai <strong> ou <b>
   */
  private static hasStrongParent(element: Element): boolean {
    let parent = element.parentElement;
    while (parent) {
      if (['strong', 'b'].includes(parent.tagName.toLowerCase())) {
        return true;
      }
      parent = parent.parentElement;
    }
    return false;
  }

  /**
   * Verifica se o elemento tem um pai <em> ou <i>
   */
  private static hasEmphasisParent(element: Element): boolean {
    let parent = element.parentElement;
    while (parent) {
      if (['em', 'i'].includes(parent.tagName.toLowerCase())) {
        return true;
      }
      parent = parent.parentElement;
    }
    return false;
  }

  /**
   * Adiciona uma classe a um elemento sem duplicar
   */
  private static addClassToElement(existingClasses: string, newClass: string): string {
    const classes = existingClasses ? existingClasses.split(' ') : [];
    if (!classes.includes(newClass)) {
      classes.push(newClass);
    }
    return classes.filter(Boolean).join(' ');
  }

  /**
   * Verifica se o elemento tem formatação em negrito baseado no estilo
   */
  private static isBoldFromStyle(style: string): boolean {
    // Verificar no estilo inline com diferentes variações
    const boldPatterns = [
      /font-weight:\s*bold/i,
      /font-weight:\s*[6-9]00/,
      /font-weight:\s*700/,
      /font-weight:\s*800/,
      /font-weight:\s*900/
    ];
    
    return boldPatterns.some(pattern => pattern.test(style));
  }

  /**
   * Verifica se o elemento tem formatação em itálico baseado no estilo
   */
  private static isItalicFromStyle(style: string): boolean {
    // Verificar no estilo inline
    return /font-style:\s*italic/.test(style);
  }

  /**
   * Extrai cor do texto e converte para classe Tailwind
   */
  private static extractTextColor(style: string): string | null {
    const colorMatch = style.match(/color:\s*([^;]+)/);
    if (!colorMatch) return null;
    
    const color = colorMatch[1].trim();
    
    // Mapear cores comuns para classes Tailwind
    const colorMap: Record<string, string> = {
      'red': 'text-red-600',
      'blue': 'text-blue-600',
      'green': 'text-green-600',
      'yellow': 'text-yellow-600',
      'purple': 'text-purple-600',
      'pink': 'text-pink-600',
      'orange': 'text-orange-600',
      'gray': 'text-gray-600',
      'black': 'text-black',
      'white': 'text-white',
      '#ff0000': 'text-red-600',
      '#00ff00': 'text-green-600',
      '#0000ff': 'text-blue-600',
      '#ffff00': 'text-yellow-400',
      '#ff00ff': 'text-pink-600',
      '#00ffff': 'text-cyan-400',
      '#800080': 'text-purple-600',
      '#ffa500': 'text-orange-500'
    };
    
    // Buscar cor exata primeiro
    if (colorMap[color.toLowerCase()]) {
      return colorMap[color.toLowerCase()];
    }
    
    // Tentar converter RGB para classe adequada
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch.map(Number);
      return this.rgbToTailwindColor(r, g, b);
    }
    
    return null;
  }

  /**
   * Extrai cor de fundo e converte para classe Tailwind
   */
  private static extractBackgroundColor(style: string): string | null {
    const bgMatch = style.match(/background-color:\s*([^;]+)/);
    if (!bgMatch) return null;
    
    const color = bgMatch[1].trim();
    
    // Mapear cores de fundo para classes Tailwind
    const bgColorMap: Record<string, string> = {
      'yellow': 'bg-yellow-200',
      'red': 'bg-red-200',
      'blue': 'bg-blue-200',
      'green': 'bg-green-200',
      'purple': 'bg-purple-200',
      'pink': 'bg-pink-200',
      'orange': 'bg-orange-200',
      'gray': 'bg-gray-200',
      '#ffff00': 'bg-yellow-200',
      '#ff0000': 'bg-red-200',
      '#00ff00': 'bg-green-200',
      '#0000ff': 'bg-blue-200',
      '#ff00ff': 'bg-pink-200',
      '#ffa500': 'bg-orange-200'
    };
    
    return bgColorMap[color.toLowerCase()] || null;
  }

  /**
   * Converte RGB para classe Tailwind mais próxima
   */
  private static rgbToTailwindColor(r: number, g: number, b: number): string {
    // Determinar cor dominante
    if (r > g && r > b) {
      return r > 200 ? 'text-red-400' : 'text-red-600';
    } else if (g > r && g > b) {
      return g > 200 ? 'text-green-400' : 'text-green-600';
    } else if (b > r && b > g) {
      return b > 200 ? 'text-blue-400' : 'text-blue-600';
    } else if (r > 150 && g > 150) {
      return 'text-yellow-500';
    } else if (r > 150 && b > 150) {
      return 'text-pink-500';
    } else if (g > 150 && b > 150) {
      return 'text-cyan-500';
    }
    
    // Fallback para cinza baseado na luminosidade
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 128 ? 'text-gray-400' : 'text-gray-600';
  }

  /**
   * Processa listas (ordenadas e não ordenadas)
   */
  private static processLists(container: HTMLElement) {
    // Procurar por listas existentes e melhorar sua formatação
    const lists = container.querySelectorAll('ul, ol');
    lists.forEach(list => {
      list.className = list.tagName.toLowerCase() === 'ul' 
        ? 'list-disc list-inside space-y-1 ml-4'
        : 'list-decimal list-inside space-y-1 ml-4';
    });

    // Detectar listas baseadas em texto (linhas que começam com -, *, •, números)
    this.detectTextBasedLists(container);
  }

  /**
   * Detecta e converte listas baseadas em texto
   */
  private static detectTextBasedLists(container: HTMLElement) {
    const textNodes = this.getTextNodes(container);
    let currentList: HTMLElement | null = null;
    let currentListType: 'ul' | 'ol' | null = null;

    textNodes.forEach(node => {
      const text = node.textContent?.trim() || '';
      const lines = text.split('\n').filter(line => line.trim());

      lines.forEach(line => {
        const trimmedLine = line.trim();
        
        // Detectar item de lista não ordenada
        if (/^[-•*]\s+/.test(trimmedLine)) {
          if (currentListType !== 'ul') {
            currentList = document.createElement('ul');
            currentList.className = 'list-disc list-inside space-y-1 ml-4';
            currentListType = 'ul';
            node.parentNode?.insertBefore(currentList, node);
          }
          
          const li = document.createElement('li');
          li.textContent = trimmedLine.replace(/^[-•*]\s+/, '');
          currentList?.appendChild(li);
        }
        // Detectar item de lista ordenada
        else if (/^\d+\.\s+/.test(trimmedLine)) {
          if (currentListType !== 'ol') {
            currentList = document.createElement('ol');
            currentList.className = 'list-decimal list-inside space-y-1 ml-4';
            currentListType = 'ol';
            node.parentNode?.insertBefore(currentList, node);
          }
          
          const li = document.createElement('li');
          li.textContent = trimmedLine.replace(/^\d+\.\s+/, '');
          currentList?.appendChild(li);
        }
        // Quebra de lista
        else if (trimmedLine.length > 0) {
          currentList = null;
          currentListType = null;
        }
      });
    });
  }

  /**
   * Processa parágrafos identificando quebras de linha e espaçamento adequado
   */
  private static processParagraphs(container: HTMLElement) {
    // Processar nós de texto que não estão em títulos ou listas
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Ignorar texto em títulos e listas
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          
          const tagName = parent.tagName.toLowerCase();
          if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li'].includes(tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const textNodes: Text[] = [];
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent?.trim()) {
        textNodes.push(node as Text);
      }
    }

    // Processar cada nó de texto para identificar parágrafos
    textNodes.forEach(textNode => {
      const text = textNode.textContent || '';
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      
      if (lines.length <= 1) return; // Não é necessário processar uma única linha
      
      // Criar parágrafos para cada linha significativa
      const fragment = document.createDocumentFragment();
      
      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine.length === 0) return;
        
        // Verificar se parece um parágrafo (não é título nem lista)
        const isTitle = this.looksLikeTitle(trimmedLine, lines, index);
        const isList = /^[-•*]\s+/.test(trimmedLine) || /^\d+\.\s+/.test(trimmedLine);
        
        if (!isTitle && !isList && trimmedLine.length > 20) {
          const p = document.createElement('p');
          p.className = 'mb-2 text-gray-900 dark:text-gray-100 leading-relaxed';
          p.textContent = trimmedLine;
          fragment.appendChild(p);
        } else {
          // Para linhas curtas ou especiais, manter como texto simples
          const span = document.createElement('span');
          span.textContent = trimmedLine;
          span.className = 'block mb-1';
          fragment.appendChild(span);
        }
      });
      
      // Substituir o nó de texto original pelos parágrafos processados
      if (fragment.children.length > 0) {
        textNode.parentNode?.replaceChild(fragment, textNode);
      }
    });
  }

  /**
   * Obtém todos os nós de texto de um elemento
   */
  private static getTextNodes(element: HTMLElement): Text[] {
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT
    );
    
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent?.trim()) {
        textNodes.push(node as Text);
      }
    }
    
    return textNodes;
  }

  /**
   * Processa texto simples detectando padrões de título e lista
   */
  private static processPlainTextContent(text: string): ProcessedContent {
    const lines = text.split('\n').filter(line => line.trim());
    const processedLines: string[] = [];
    let inList = false;
    let listType: 'ul' | 'ol' | null = null;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Detectar títulos (linhas curtas, começando com maiúscula, sem pontuação final)
      if (this.looksLikeTitle(trimmedLine, lines, index)) {
        if (inList) {
          processedLines.push(listType === 'ul' ? '</ul>' : '</ol>');
          inList = false;
          listType = null;
        }
        
        const level = this.inferTitleLevel(trimmedLine, lines, index);
        processedLines.push(`<h${level} class="${this.getHeadingClasses(level)}">${trimmedLine}</h${level}>`);
      }
      // Detectar listas não ordenadas
      else if (/^[-•*]\s+/.test(trimmedLine)) {
        if (!inList || listType !== 'ul') {
          if (inList) processedLines.push(listType === 'ul' ? '</ul>' : '</ol>');
          processedLines.push('<ul class="list-disc list-inside space-y-1 ml-4">');
          inList = true;
          listType = 'ul';
        }
        processedLines.push(`<li>${trimmedLine.replace(/^[-•*]\s+/, '')}</li>`);
      }
      // Detectar listas ordenadas
      else if (/^\d+\.\s+/.test(trimmedLine)) {
        if (!inList || listType !== 'ol') {
          if (inList) processedLines.push(listType === 'ul' ? '</ul>' : '</ol>');
          processedLines.push('<ol class="list-decimal list-inside space-y-1 ml-4">');
          inList = true;
          listType = 'ol';
        }
        processedLines.push(`<li>${trimmedLine.replace(/^\d+\.\s+/, '')}</li>`);
      }
      // Texto normal - detectar se é parágrafo ou linha simples
      else {
        if (inList) {
          processedLines.push(listType === 'ul' ? '</ul>' : '</ol>');
          inList = false;
          listType = null;
        }
        
        if (trimmedLine) {
          // Processar formatação básica em texto simples
          const formattedText = this.processPlainTextFormatting(trimmedLine);
          
          // Determinar se é um parágrafo ou linha simples
          const isParagraph = this.isParagraph(trimmedLine, lines, index);
          
          if (isParagraph) {
            processedLines.push(`<p class="mb-2 text-gray-900 dark:text-gray-100 leading-relaxed">${formattedText}</p>`);
          } else {
            processedLines.push(`<span class="block mb-1 text-gray-900 dark:text-gray-100">${formattedText}</span>`);
          }
        }
      }
    });

    // Fechar lista se ainda estiver aberta
    if (inList) {
      processedLines.push(listType === 'ul' ? '</ul>' : '</ol>');
    }

    const html = processedLines.join('\n');
    
    return {
      html,
      plainText: text
    };
  }

  /**
   * Verifica se uma linha parece ser um título
   */
  private static looksLikeTitle(line: string, allLines: string[], index: number): boolean {
    // Muito curta ou muito longa
    if (line.length < 3 || line.length > 150) return false;
    
    // Deve começar com maiúscula
    if (!/^[A-ZÀ-Ÿ]/.test(line)) return false;
    
    // Não deve terminar com pontuação
    if (/[.!?]$/.test(line)) return false;
    
    // Deve ser mais curta que a próxima linha (se houver)
    const nextLine = allLines[index + 1];
    if (nextLine && line.length >= nextLine.length) return false;
    
    return true;
  }

  /**
   * Infere o nível do título baseado no contexto
   */
  private static inferTitleLevel(line: string, _allLines: string[], index: number): number {
    // Título principal (primeiro ou muito curto)
    if (index === 0 || line.length < 20) return 1;
    
    // Baseado no tamanho relativo
    if (line.length < 30) return 2;
    if (line.length < 50) return 3;
    return 4;
  }

  /**
   * Retorna classes CSS para títulos
   */
  private static getHeadingClasses(level: number): string {
    const baseClasses = 'font-bold text-gray-900 dark:text-white mb-2 mt-4';
    
    switch (level) {
      case 1: return `${baseClasses} text-2xl`;
      case 2: return `${baseClasses} text-xl`;
      case 3: return `${baseClasses} text-lg`;
      case 4: return `${baseClasses} text-base`;
      case 5: return `${baseClasses} text-sm`;
      case 6: return `${baseClasses} text-xs`;
      default: return `${baseClasses} text-base`;
    }
  }

  /**
   * Limpa HTML desnecessário mantendo estrutura e formatação essencial
   */
  private static cleanHTML(container: HTMLElement) {
    // Primeiro, remover elementos vazios que não são de formatação
    const emptyElements = container.querySelectorAll('*:empty');
    emptyElements.forEach(element => {
      const tagName = element.tagName.toLowerCase();
      // Não remover elementos de formatação mesmo se vazios
      if (!['b', 'strong', 'i', 'em', 'br', 'hr'].includes(tagName)) {
        element.remove();
      }
    });
    
    // Remover atributos desnecessários mas manter estrutura e formatação
    const elements = container.querySelectorAll('*');
    elements.forEach(element => {
      const tagName = element.tagName.toLowerCase();
      
      // Para elementos de formatação, manter estrutura mínima
      if (['b', 'strong', 'i', 'em'].includes(tagName)) {
        // Manter apenas class
        const allowedAttributes = ['class'];
        const attributes = Array.from(element.attributes);
        attributes.forEach(attr => {
          if (!allowedAttributes.includes(attr.name)) {
            element.removeAttribute(attr.name);
          }
        });
        return;
      }
      
      // Para outros elementos, manter classes, atributos essenciais e style seletivo
      const allowedAttributes = ['class', 'href', 'src', 'alt', 'style'];
      const attributes = Array.from(element.attributes);
      
      attributes.forEach(attr => {
        if (attr.name === 'style') {
          // Manter apenas estilos essenciais de formatação
          const style = attr.value;
          const essentialStyles: string[] = [];
          
          // Preservar apenas cores e estilos que não interferem com a estrutura
          const color = style.match(/color:\s*[^;]+/);
          if (color) {
            essentialStyles.push(color[0]);
          }
          
          const backgroundColor = style.match(/background-color:\s*[^;]+/);
          if (backgroundColor) {
            essentialStyles.push(backgroundColor[0]);
          }
          
          // Aplicar apenas estilos essenciais ou remover o atributo
          if (essentialStyles.length > 0) {
            element.setAttribute('style', essentialStyles.join('; '));
          } else {
            element.removeAttribute('style');
          }
        } else if (!allowedAttributes.includes(attr.name)) {
          element.removeAttribute(attr.name);
        }
      });
    });
    
    // Consolidar elementos de formatação aninhados desnecessariamente
    this.consolidateFormatting(container);
  }

  /**
   * Consolida elementos de formatação aninhados
   */
  private static consolidateFormatting(container: HTMLElement) {
    // Encontrar elementos <strong> ou <b> aninhados
    const nestedBold = container.querySelectorAll('strong strong, strong b, b strong, b b');
    nestedBold.forEach(inner => {
      const outer = inner.parentElement;
      if (outer && ['b', 'strong'].includes(outer.tagName.toLowerCase())) {
        // Move o conteúdo do elemento interno para o externo
        while (inner.firstChild) {
          outer.insertBefore(inner.firstChild, inner);
        }
        inner.remove();
      }
    });
    
    // Encontrar elementos <em> ou <i> aninhados
    const nestedItalic = container.querySelectorAll('em em, em i, i em, i i');
    nestedItalic.forEach(inner => {
      const outer = inner.parentElement;
      if (outer && ['i', 'em'].includes(outer.tagName.toLowerCase())) {
        // Move o conteúdo do elemento interno para o externo
        while (inner.firstChild) {
          outer.insertBefore(inner.firstChild, inner);
        }
        inner.remove();
      }
    });
  }

  /**
   * Converte HTML para texto simples preservando estrutura
   */
  private static htmlToPlainText(html: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Substituir títulos por texto com quebras
    tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
      const text = heading.textContent || '';
      heading.replaceWith(document.createTextNode(`\n${text}\n`));
    });
    
    // Substituir listas por texto simples
    tempDiv.querySelectorAll('li').forEach(li => {
      const text = li.textContent || '';
      li.replaceWith(document.createTextNode(`• ${text}\n`));
    });
    
    // Substituir parágrafos por quebras simples
    tempDiv.querySelectorAll('p').forEach(p => {
      const text = p.textContent || '';
      p.replaceWith(document.createTextNode(`${text}\n`));
    });
    
    return tempDiv.textContent?.trim() || '';
  }

  /**
   * Determina se uma linha deve ser tratada como parágrafo
   */
  private static isParagraph(line: string, allLines: string[], index: number): boolean {
    // Critérios para ser considerado parágrafo:
    // 1. Deve ter pelo menos 20 caracteres (conteúdo substancial)
    // 2. Não deve ser título
    // 3. Não deve ser item de lista
    // 4. Deve terminar com pontuação adequada ou ter continuidade
    
    const trimmedLine = line.trim();
    
    // Muito curto para ser parágrafo
    if (trimmedLine.length < 20) return false;
    
    // É título
    if (this.looksLikeTitle(trimmedLine, allLines, index)) return false;
    
    // É item de lista
    if (/^[-•*]\s+/.test(trimmedLine) || /^\d+\.\s+/.test(trimmedLine)) return false;
    
    // Verifica se tem pontuação de fim de sentença ou parece continuar
    const endsWithPunctuation = /[.!?;:]$/.test(trimmedLine);
    const hasMultipleSentences = (trimmedLine.match(/[.!?]/g) || []).length > 0;
    const hasConjunctions = /\b(e|ou|mas|porém|contudo|entretanto|no entanto|por isso|portanto|assim|dessa forma)\b/i.test(trimmedLine);
    
    // Considerar parágrafo se:
    // - Termina com pontuação adequada, OU
    // - Tem múltiplas sentenças, OU
    // - Tem conjunções (indica texto corrido), OU
    // - É suficientemente longo (mais de 60 caracteres)
    return endsWithPunctuation || hasMultipleSentences || hasConjunctions || trimmedLine.length > 60;
  }

  /**
   * Processa formatação básica em texto simples (negrito, itálico)
   */
  private static processPlainTextFormatting(text: string): string {
    let formattedText = text;
    
    // Processar negrito - texto entre **texto** ou __texto__
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
    formattedText = formattedText.replace(/__(.*?)__/g, '<strong class="font-bold">$1</strong>');
    
    // Processar itálico - texto entre *texto* ou _texto_
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    formattedText = formattedText.replace(/_(.*?)_/g, '<em class="italic">$1</em>');
    
    // Processar sublinhado - texto entre ++texto++
    formattedText = formattedText.replace(/\+\+(.*?)\+\+/g, '<u class="underline">$1</u>');
    
    // Processar código inline - texto entre `código`
    formattedText = formattedText.replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
    
    return formattedText;
  }
}
