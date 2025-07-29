import jsPDF from 'jspdf';
import { PdfExportData, PdfGenerationOptions, ExportEntry, ExportField } from '../types/exportTypes';
import { LogoService } from './LogoService';
import { PdfLogoRenderer } from './PdfLogoRenderer';

/**
 * Serviço responsável pela geração de PDFs com dados da tabela
 */
export class PdfExportService {
  /**
   * Gera e faz download do PDF com os dados fornecidos
   */
  static async generatePdf(data: PdfExportData): Promise<void> {
    try {
      console.log('🚀 [PDF] Iniciando geração de PDF');
      console.log('📊 [PDF] Dados recebidos:', {
        formTitle: data.formTitle,
        totalEntries: data.totalEntries,
        fieldsCount: data.fields.length,
        entriesCount: data.entries.length,
        hasLogo: !!data.logoBase64
      });

      // Carregar logo se não foi fornecido
      let logoBase64 = data.logoBase64;
      if (!logoBase64) {
        console.log('🎨 [PDF] Carregando logo da plataforma...');
        const logoResult = await LogoService.getLogoForPdf(false); // Usar logo claro
        logoBase64 = logoResult || undefined;
        console.log('🎨 [PDF] Logo carregado:', !!logoBase64);
      }

      const options: PdfGenerationOptions = {
        title: `Relatório - ${data.formTitle}`,
        subtitle: `Exportado em ${data.exportDate}`,
        includeHeader: true,
        includeFooter: true,
        pageOrientation: 'landscape'
      };

      console.log('⚙️ [PDF] Configurações:', options);

      const pdf = new jsPDF({
        orientation: options.pageOrientation,
        unit: 'mm',
        format: 'a4'
      });

      console.log('📄 [PDF] Objeto jsPDF criado');

      // Configurar fonte padrão
      pdf.setFont('helvetica');
      console.log('🔤 [PDF] Fonte configurada');

      // Adicionar cabeçalho
      if (options.includeHeader) {
        console.log('📋 [PDF] Adicionando cabeçalho...');
        this.addHeader(pdf, options);
        console.log('✅ [PDF] Cabeçalho adicionado');
      }

      // Adicionar tabela com dados
      console.log('📊 [PDF] Adicionando tabela...');
      this.addDataTable(pdf, data);
      console.log('✅ [PDF] Tabela adicionada');

      // Adicionar rodapé com logo
      if (options.includeFooter) {
        console.log('📋 [PDF] Adicionando rodapé...');
        this.addFooter(pdf, data, logoBase64);
        console.log('✅ [PDF] Rodapé adicionado');
      }

      // Fazer download do arquivo
      const fileName = this.generateFileName(data.formTitle);
      console.log('💾 [PDF] Nome do arquivo:', fileName);
      
      pdf.save(fileName);
      console.log('🎉 [PDF] PDF gerado e salvo com sucesso!');
    } catch (error) {
      console.error('❌ [PDF] Erro detalhado ao gerar PDF:', error);
      console.error('📊 [PDF] Stack trace:', error instanceof Error ? error.stack : 'N/A');
      console.error('📊 [PDF] Dados que causaram erro:', data);
      throw new Error(`Falha ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Adiciona cabeçalho ao PDF
   */
  private static addHeader(pdf: jsPDF, options: PdfGenerationOptions): void {
    try {
      console.log('🏷️ [PDF Header] Iniciando adição do cabeçalho');
      const pageWidth = pdf.internal.pageSize.getWidth();
      console.log('📏 [PDF Header] Largura da página:', pageWidth);
      
      // Título principal
      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 0); // PRETO - GARANTIR COR PRETA
      console.log('📝 [PDF Header] Adicionando título:', options.title);
      pdf.text(options.title, pageWidth / 2, 20, { align: 'center' });

      // Subtítulo
      if (options.subtitle) {
        pdf.setFontSize(12);
        pdf.setTextColor(100, 100, 100); // Cinza para subtítulo
        console.log('📝 [PDF Header] Adicionando subtítulo:', options.subtitle);
        pdf.text(options.subtitle, pageWidth / 2, 30, { align: 'center' });
      }

      // Linha separadora
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, 35, pageWidth - 20, 35);
      console.log('➖ [PDF Header] Linha separadora adicionada');
    } catch (error) {
      console.error('❌ [PDF Header] Erro ao adicionar cabeçalho:', error);
      throw error;
    }
  }

  /**
   * Adiciona tabela com dados ao PDF (versão manual sem autoTable)
   */
  private static addDataTable(pdf: jsPDF, data: PdfExportData): void {
    try {
      console.log('📊 [PDF Table] Iniciando criação da tabela manual');
      
      // Preparar cabeçalhos da tabela
      console.log('📋 [PDF Table] Preparando cabeçalhos...');
      const headers = this.prepareTableHeaders(data.fields);
      console.log('📋 [PDF Table] Cabeçalhos preparados:', headers);
      
      // Preparar dados da tabela
      console.log('📊 [PDF Table] Preparando dados das linhas...');
      const rows = this.prepareTableRows(data.entries, data.fields);
      console.log('📊 [PDF Table] Linhas preparadas:', rows.length, 'linhas');

      // Configurações da tabela com larguras fixas para evitar sobreposição
      const startY = 50;
      const startX = 10; // Margem menor para aproveitar mais espaço
      const rowHeight = 12; // Altura maior para melhor legibilidade
      const pageWidth = pdf.internal.pageSize.getWidth();
      const availableWidth = pageWidth - 20; // 10px de margem de cada lado

      // Definir larguras específicas para cada coluna
      const columnWidths = this.calculateColumnWidths(headers, availableWidth);

      console.log('📏 [PDF Table] Configurações:', {
        startY, startX, rowHeight, 
        pageWidth: pageWidth.toFixed(2), 
        availableWidth: availableWidth.toFixed(2),
        headers: headers.length,
        columnWidths
      });

      // Desenhar cabeçalhos com cor vermelha #d30000
      pdf.setFillColor(211, 0, 0); // #d30000 em RGB
      pdf.setTextColor(255, 255, 255); // Branco
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');

      let currentY = startY;
      let currentX = startX;
      
      // Primeiro desenhar o fundo completo do cabeçalho
      pdf.rect(startX, currentY, availableWidth, rowHeight, 'F');
      
      // Depois desenhar bordas e texto de cada cabeçalho
      headers.forEach((header, index) => {
        const colWidth = columnWidths[index];
        
        // Borda do cabeçalho
        pdf.setDrawColor(150, 150, 150);
        pdf.rect(currentX, currentY, colWidth, rowHeight);
        
        // Texto do cabeçalho (centralizado e truncado se necessário)
        const headerText = header.length > 12 ? header.substring(0, 10) + '..' : header;
        const textX = currentX + (colWidth / 2);
        pdf.text(headerText, textX, currentY + 8, { align: 'center' });
        
        currentX += colWidth;
      });

      currentY += rowHeight;

      // Desenhar linhas de dados
      pdf.setTextColor(0, 0, 0); // Preto - FORÇAR SEMPRE PRETO
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);

      rows.forEach((row, rowIndex) => {
        currentX = startX;
        
        // Alternar cor de fundo das linhas
        if (rowIndex % 2 === 0) {
          pdf.setFillColor(248, 248, 248); // Cinza bem claro
          pdf.rect(startX, currentY, availableWidth, rowHeight, 'F');
        }

        // Desenhar células da linha
        row.forEach((cell, colIndex) => {
          const colWidth = columnWidths[colIndex];
          
          // Borda da célula
          pdf.setDrawColor(200, 200, 200);
          pdf.rect(currentX, currentY, colWidth, rowHeight);
          
          // GARANTIR COR PRETA PARA TODAS AS CÉLULAS
          pdf.setTextColor(0, 0, 0); // Preto - FORÇAR SEMPRE PRETO
          
          // Texto da célula (truncado conforme largura da coluna)
          const maxChars = Math.floor(colWidth / 2.5); // Aproximadamente 2.5px por caractere
          let cellText = String(cell || '-');
          
          if (cellText.length > maxChars) {
            cellText = cellText.substring(0, maxChars - 2) + '..';
          }
          
          // Posicionar texto com pequena margem interna
          pdf.text(cellText, currentX + 2, currentY + 8);
          
          currentX += colWidth;
        });

        currentY += rowHeight;

        // Verificar se precisa de nova página
        if (currentY > pdf.internal.pageSize.getHeight() - 40) {
          pdf.addPage();
          currentY = 30;
          
          // Redesenhar cabeçalho na nova página
          this.redrawTableHeader(pdf, headers, columnWidths, startX, currentY);
          currentY += rowHeight;
        }
      });
      
      console.log('✅ [PDF Table] Tabela manual criada com sucesso');
    } catch (error) {
      console.error('❌ [PDF Table] Erro ao criar tabela manual:', error);
      throw error;
    }
  }

  /**
   * Calcula larguras das colunas baseado no conteúdo e espaço disponível (URL, Preço, DA)
   */
  private static calculateColumnWidths(headers: string[], availableWidth: number): number[] {
    // Larguras específicas para as 3 colunas principais
    const baseWidths: Record<string, number> = {
      'URL': 120,      // URL precisa de mais espaço
      'Preço': 60,     // Preço formato R$ XX,XX
      'DA': 40         // DA é número pequeno
    };

    const columnWidths: number[] = [];
    let usedWidth = 0;

    console.log('📏 [PDF Columns] Headers recebidos:', headers);

    // Primeiro passo: atribuir larguras específicas
    headers.forEach(header => {
      // Buscar por palavras-chave no header para identificar o tipo
      let baseWidth = 60; // padrão
      
      if (header.toLowerCase().includes('url') || header.toLowerCase().includes('site')) {
        baseWidth = baseWidths['URL'] || 120;
      } else if (header.toLowerCase().includes('preço') || header.toLowerCase().includes('preco') || header.toLowerCase().includes('price')) {
        baseWidth = baseWidths['Preço'] || 60;
      } else if (header.toLowerCase().includes('da') || header.toLowerCase().includes('domain authority')) {
        baseWidth = baseWidths['DA'] || 40;
      }

      columnWidths.push(baseWidth);
      usedWidth += baseWidth;
    });

    console.log('📏 [PDF Columns] Larguras iniciais:', columnWidths);
    console.log('📏 [PDF Columns] Largura usada/disponível:', usedWidth, '/', availableWidth);

    // Segundo passo: ajustar se necessário
    if (usedWidth > availableWidth) {
      // Reduzir proporcionalmente se ultrapassar
      const scaleFactor = availableWidth / usedWidth;
      for (let i = 0; i < columnWidths.length; i++) {
        columnWidths[i] = columnWidths[i] * scaleFactor;
      }
      console.log('📏 [PDF Columns] Larguras reduzidas:', columnWidths);
    } else {
      // Se sobrar espaço, distribuir igualmente
      const extraSpace = availableWidth - usedWidth;
      const extraPerColumn = extraSpace / headers.length;
      for (let i = 0; i < columnWidths.length; i++) {
        columnWidths[i] += extraPerColumn;
      }
      console.log('📏 [PDF Columns] Larguras expandidas:', columnWidths);
    }

    return columnWidths;
  }

  /**
   * Redesenha o cabeçalho da tabela em uma nova página
   */
  private static redrawTableHeader(pdf: jsPDF, headers: string[], columnWidths: number[], startX: number, startY: number): void {
    pdf.setFillColor(211, 0, 0); // #d30000
    pdf.setTextColor(255, 255, 255); // Branco para cabeçalhos
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');

    const availableWidth = columnWidths.reduce((sum, width) => sum + width, 0);
    
    // Primeiro desenhar o fundo completo do cabeçalho
    pdf.rect(startX, startY, availableWidth, 12, 'F');
    
    let currentX = startX;
    
    // Depois desenhar bordas e texto de cada cabeçalho
    headers.forEach((header, index) => {
      const colWidth = columnWidths[index];
      
      // Borda
      pdf.setDrawColor(150, 150, 150);
      pdf.rect(currentX, startY, colWidth, 12);
      
      // GARANTIR COR BRANCA PARA CABEÇALHOS
      pdf.setTextColor(255, 255, 255); // Branco
      
      // Texto
      const headerText = header.length > 12 ? header.substring(0, 10) + '..' : header;
      const textX = currentX + (colWidth / 2);
      pdf.text(headerText, textX, startY + 8, { align: 'center' });
      
      currentX += colWidth;
    });
  }

  /**
   * Adiciona rodapé ao PDF
   */
  private static addFooter(
    pdf: jsPDF, 
    data: PdfExportData, 
    logoBase64?: string
  ): void {
    try {
      console.log('📋 [Footer] Adicionando rodapé');
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const footerY = pageHeight - 15;

      // Adicionar linha separadora
      pdf.setDrawColor(211, 0, 0); // #d30000
      pdf.setLineWidth(0.5);
      pdf.line(20, footerY - 5, pageWidth - 20, footerY - 5);

      // Adicionar informações de exportação
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0); // PRETO - GARANTIR COR PRETA PARA RODAPÉ
      
      const footerText = `Total de ${data.totalEntries} registros | Exportado em ${data.exportDate}`;
      pdf.text(footerText, 20, footerY);

      // Adicionar logo no rodapé se disponível
      if (logoBase64) {
        console.log('🎨 [Footer] Adicionando logo ao rodapé');
        PdfLogoRenderer.addLogoToFooter(pdf, logoBase64, pageWidth, pageHeight);
        console.log('✅ [Footer] Logo adicionado ao rodapé');
      } else {
        console.log('⚠️ [Footer] Logo não disponível');
      }

      console.log('✅ [Footer] Rodapé concluído');
    } catch (error) {
      console.error('❌ [Footer] Erro ao adicionar rodapé:', error);
      throw error;
    }
  }

  /**
   * Prepara cabeçalhos da tabela (apenas URL, Preço e DA)
   */
  private static prepareTableHeaders(fields: ExportField[]): string[] {
    // Identificar campos específicos por tipo/nome
    const urlField = fields.find(f => 
      f.field_type === 'url' || 
      f.label?.toLowerCase().includes('url') ||
      f.label?.toLowerCase().includes('site')
    );
    
    const daField = fields.find(f => 
      f.label?.toLowerCase().includes('da') ||
      f.label?.toLowerCase().includes('domain authority') ||
      (f.field_type === 'number' && f.label?.toLowerCase().includes('da'))
    );
    
    const precoField = fields.find(f => 
      f.field_type === 'product' ||
      f.label?.toLowerCase().includes('preço') ||
      f.label?.toLowerCase().includes('preco') ||
      f.label?.toLowerCase().includes('price')
    );

    const headers: string[] = [];
    
    // Adicionar apenas os cabeçalhos dos campos que existem
    if (urlField) headers.push(urlField.label || 'URL');
    if (precoField) headers.push(precoField.label || 'Preço');
    if (daField) headers.push(daField.label || 'DA');

    console.log('📋 [PDF Headers] Cabeçalhos filtrados:', headers);
    return headers;
  }

  /**
   * Prepara dados das linhas da tabela (apenas URL, Preço e DA)
   * IMPORTANTE: Processa TODOS os entries, não apenas os paginados
   */
  private static prepareTableRows(entries: ExportEntry[], fields: ExportField[]): string[][] {
    // Identificar campos específicos por tipo/nome
    const urlField = fields.find(f => 
      f.field_type === 'url' || 
      f.label?.toLowerCase().includes('url') ||
      f.label?.toLowerCase().includes('site')
    );
    
    const daField = fields.find(f => 
      f.label?.toLowerCase().includes('da') ||
      f.label?.toLowerCase().includes('domain authority') ||
      (f.field_type === 'number' && f.label?.toLowerCase().includes('da'))
    );
    
    const precoField = fields.find(f => 
      f.field_type === 'product' ||
      f.label?.toLowerCase().includes('preço') ||
      f.label?.toLowerCase().includes('preco') ||
      f.label?.toLowerCase().includes('price')
    );

    console.log('🔍 [PDF Rows] Campos identificados:', {
      url: urlField?.label,
      preco: precoField?.label,
      da: daField?.label
    });

    console.log('📊 [PDF Rows] Processando TODOS os', entries.length, 'registros');

    return entries.map((entry, index) => {
      const rowData: string[] = [];

      // URL
      if (urlField) {
        const urlValue = this.formatFieldValue(entry.values[urlField.id], urlField.field_type);
        rowData.push(urlValue);
      }

      // Preço
      if (precoField) {
        const precoValue = this.formatFieldValue(entry.values[precoField.id], precoField.field_type);
        console.log(`💰 [PDF Rows] Registro ${index + 1} - Preço formatado:`, {
          original: entry.values[precoField.id],
          formatted: precoValue,
          fieldType: precoField.field_type
        });
        rowData.push(precoValue);
      }

      // DA
      if (daField) {
        const daValue = this.formatFieldValue(entry.values[daField.id], daField.field_type);
        rowData.push(daValue);
      }

      console.log(`📊 [PDF Rows] Registro ${index + 1} processado:`, rowData);
      return rowData;
    });
  }

  /**
   * Formata valor do campo baseado no tipo
   * IMPORTANTE: Todos os valores formatados aqui serão renderizados em PRETO
   */
  private static formatFieldValue(value: any, fieldType: string): string {
    if (!value && value !== 0) return '-';

    switch (fieldType) {
      case 'product':
        if (typeof value === 'object' && value.price) {
          // Verificar se o price já tem R$ para evitar duplicação
          const priceValue = String(value.price);
          if (priceValue.includes('R$')) {
            return priceValue; // Já formatado
          } else {
            return `R$ ${priceValue}`;
          }
        }
        // Se não for objeto, verificar se é string com R$
        const stringValue = String(value);
        if (stringValue.includes('R$')) {
          return stringValue;
        } else {
          return `R$ ${stringValue}`;
        }
      
      case 'url':
        if (typeof value === 'string' && value.startsWith('http')) {
          return value.length > 50 ? `${value.substring(0, 50)}...` : value;
        }
        return String(value);
      
      case 'number':
        // Para DA (Domain Authority), só retornar o número
        return String(value);
      
      case 'email':
        return String(value);
      
      default:
        if (typeof value === 'object') {
          return JSON.stringify(value).substring(0, 100);
        }
        return String(value).substring(0, 100);
    }
  }

  /**
   * Gera nome do arquivo PDF
   */
  private static generateFileName(formTitle: string): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    
    const sanitizedTitle = formTitle
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase();

    return `${sanitizedTitle}_${dateStr}_${timeStr}.pdf`;
  }
}
