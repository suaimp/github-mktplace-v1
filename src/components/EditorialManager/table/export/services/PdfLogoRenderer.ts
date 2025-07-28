import jsPDF from 'jspdf';

/**
 * Interface para configuração de logo no PDF
 */
export interface PdfLogoConfig {
  base64Data: string;
  x: number;
  y: number;
  width: number;
  height: number;
  format?: 'PNG' | 'JPEG';
}

/**
 * Serviço responsável pela renderização de logos no PDF
 */
export class PdfLogoRenderer {
  /**
   * Adiciona logo no rodapé do PDF
   */
  static addLogoToFooter(
    pdf: jsPDF, 
    logoBase64: string, 
    pageWidth: number, 
    pageHeight: number
  ): void {
    try {
      console.log('🎨 [PdfLogoRenderer] Adicionando logo ao rodapé');

      if (!logoBase64) {
        console.warn('⚠️ [PdfLogoRenderer] Logo base64 não fornecido');
        return;
      }

      // Configurações do logo no rodapé
      const logoWidth = 20;
      const logoHeight = 8;
      const marginFromBottom = 15;
      const marginFromLeft = 20;

      const logoX = marginFromLeft;
      const logoY = pageHeight - marginFromBottom - logoHeight;

      // Detectar formato da imagem
      const format = logoBase64.includes('data:image/png') ? 'PNG' : 'JPEG';

      console.log('📐 [PdfLogoRenderer] Configurações do logo:', {
        logoX,
        logoY,
        logoWidth,
        logoHeight,
        format,
        pageWidth,
        pageHeight
      });

      // Adicionar logo ao PDF
      pdf.addImage(
        logoBase64,
        format,
        logoX,
        logoY,
        logoWidth,
        logoHeight
      );

      console.log('✅ [PdfLogoRenderer] Logo adicionado com sucesso');
    } catch (error) {
      console.error('❌ [PdfLogoRenderer] Erro ao adicionar logo:', error);
    }
  }

  /**
   * Adiciona logo no cabeçalho do PDF
   */
  static addLogoToHeader(
    pdf: jsPDF, 
    logoBase64: string, 
    pageWidth: number
  ): void {
    try {
      console.log('🎨 [PdfLogoRenderer] Adicionando logo ao cabeçalho');

      if (!logoBase64) {
        console.warn('⚠️ [PdfLogoRenderer] Logo base64 não fornecido');
        return;
      }

      // Configurações do logo no cabeçalho
      const logoWidth = 25;
      const logoHeight = 10;
      const marginFromTop = 10;
      const marginFromRight = 20;

      const logoX = pageWidth - marginFromRight - logoWidth;
      const logoY = marginFromTop;

      // Detectar formato da imagem
      const format = logoBase64.includes('data:image/png') ? 'PNG' : 'JPEG';

      console.log('📐 [PdfLogoRenderer] Configurações do logo no cabeçalho:', {
        logoX,
        logoY,
        logoWidth,
        logoHeight,
        format
      });

      // Adicionar logo ao PDF
      pdf.addImage(
        logoBase64,
        format,
        logoX,
        logoY,
        logoWidth,
        logoHeight
      );

      console.log('✅ [PdfLogoRenderer] Logo no cabeçalho adicionado com sucesso');
    } catch (error) {
      console.error('❌ [PdfLogoRenderer] Erro ao adicionar logo no cabeçalho:', error);
    }
  }

  /**
   * Adiciona logo customizado com configurações específicas
   */
  static addCustomLogo(pdf: jsPDF, config: PdfLogoConfig): void {
    try {
      console.log('🎨 [PdfLogoRenderer] Adicionando logo customizado:', config);

      const format = config.format || (config.base64Data.includes('data:image/png') ? 'PNG' : 'JPEG');

      pdf.addImage(
        config.base64Data,
        format,
        config.x,
        config.y,
        config.width,
        config.height
      );

      console.log('✅ [PdfLogoRenderer] Logo customizado adicionado com sucesso');
    } catch (error) {
      console.error('❌ [PdfLogoRenderer] Erro ao adicionar logo customizado:', error);
    }
  }
}
