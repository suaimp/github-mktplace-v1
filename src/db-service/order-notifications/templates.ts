/**
 * Templates de email para notificações de pedidos
 */

import { 
  PautaEmailData, 
  ArticleDocEmailData, 
  ArticleUrlEmailData, 
  EmailTemplate 
} from './types';

export class EmailTemplateService {
  /**
   * Template para nova pauta enviada
   */
  static generatePautaTemplate(data: PautaEmailData, isAdmin: boolean = false): EmailTemplate {
    const subject = 'Nova Pauta Enviada';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #d30000;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 0 0 5px 5px;
            border: 1px solid #e4e7ec;
          }
          .info-box {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            padding: 15px;
            margin: 15px 0;
          }
          .highlight {
            background-color: #faf5f5;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
            border: 1px solid #d3000020;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
          }
          .platform-link {
            display: inline-block;
            padding: 10px 20px;
            background-color: #d30000;
            border: 1px solid #d30000;
            border-radius: 5px;
            margin: 15px 0;
            text-decoration: none !important;
            color: white !important;
            font-weight: bold;
          }
          .platform-link:hover {
            background-color: #a82020;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📝 Nova Pauta Enviada</h2>
          </div>
          <div class="content">
            <p>Uma nova pauta foi enviada para análise e está aguardando processamento.</p>
            
            <div class="info-box">
              <h3>📋 Informações do Pedido</h3>
              <p><strong>Usuário:</strong> ${data.userName}</p>
              <p><strong>ID do Pedido:</strong> ${data.shortOrderId}</p>
              <p><strong>Item:</strong> <a href="${data.productUrl}" target="_blank">${data.productName}</a></p>
            </div>

            <div class="info-box">
              <h3>📝 Dados da Pauta</h3>
              <p><strong>Palavra-chave:</strong> ${data.pautaData.palavraChave}</p>
              <p><strong>URL do Site:</strong> ${data.pautaData.urlSite}</p>
              <p><strong>Texto Âncora:</strong> ${data.pautaData.textoAncora}</p>
              <p><strong>Requisitos Especiais:</strong></p>
              <div class="highlight">
                ${data.pautaData.requisitosEspeciais || 'Nenhum requisito especial informado'}
              </div>
            </div>

            ${isAdmin ? '<p>Por favor, revise a pauta e proceda com a produção do artigo.</p>' : '<p>Por favor, aguarde a produção do artigo.</p>'}
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="http://cp.suaimprensa.com.br/orders/${data.orderId}" class="platform-link" target="_blank">
                Acessar Pedido
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>Este é um email automático do sistema Marketplace Sua Imprensa.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return { subject, html };
  }

  /**
   * Template para novo artigo enviado (upload ou link)
   */
  static generateArticleDocTemplate(data: ArticleDocEmailData, isAdmin: boolean = false): EmailTemplate {
    const subject = 'Novo Artigo Enviado';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #d30000;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 0 0 5px 5px;
            border: 1px solid #e4e7ec;
          }
          .info-box {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            padding: 15px;
            margin: 15px 0;
          }
          .download-btn {
            display: inline-block;
            padding: 12px 24px;
            background-color: #d30000;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            text-align: center;
          }
          .link-box {
            background-color: #faf5f5;
            padding: 15px;
            border-radius: 4px;
            word-break: break-all;
            margin: 10px 0;
            border: 1px solid #d3000020;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
          }
          .platform-link {
            display: inline-block;
            padding: 10px 20px;
            background-color: #d30000;
            border: 1px solid #d30000;
            border-radius: 5px;
            margin: 15px 0;
            text-decoration: none !important;
            color: white !important;
            font-weight: bold;
          }
          .platform-link:hover {
            background-color: #a82020;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📄 Novo Artigo Enviado</h2>
          </div>
          <div class="content">
            <p>Um novo artigo foi enviado para análise e está aguardando revisão.</p>
            
            <div class="info-box">
              <h3>📋 Informações do Pedido</h3>
              <p><strong>Usuário:</strong> ${data.userName}</p>
              <p><strong>ID do Pedido:</strong> ${data.shortOrderId}</p>
              <p><strong>Item:</strong> <a href="${data.productUrl}" target="_blank">${data.productName}</a></p>
            </div>

            <div class="info-box">
              <h3>📎 Dados do Artigo</h3>
              <p><strong>Tipo de Envio:</strong> ${data.articleType === 'upload' ? 'Arquivo enviado' : 'Link fornecido'}</p>
              
              ${data.articleType === 'upload' && data.articleData?.fileName ? `
                <p><strong>Nome do Arquivo:</strong> ${data.articleData.fileName}</p>
              ` : ''}
              
              ${data.articleType === 'link' && data.articleData?.articleUrl ? `
                <p><strong>Link do Artigo:</strong></p>
                <div class="link-box">
                  <a href="${data.articleData.articleUrl}" target="_blank">${data.articleData.articleUrl}</a>
                </div>
              ` : ''}
            </div>

            ${isAdmin ? '<p>Por favor, revise o artigo e proceda com a publicação.</p>' : '<p>Aguarde a revisão do artigo.</p>'}
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="http://cp.suaimprensa.com.br/orders/${data.orderId}" class="platform-link" target="_blank">
                Acessar Pedido
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>Este é um email automático do sistema Marketplace Sua Imprensa.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return { subject, html };
  }

  /**
   * Template para artigo publicado (URL final)
   */
  static generateArticleUrlTemplate(data: ArticleUrlEmailData): EmailTemplate {
    const subject = 'Novo Artigo Publicado';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #d30000;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 0 0 5px 5px;
            border: 1px solid #e4e7ec;
          }
          .info-box {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            padding: 15px;
            margin: 15px 0;
          }
          .success-badge {
            background-color: #f0ebe9;
            color: #d30000;
            padding: 10px;
            border-radius: 4px;
            text-align: center;
            margin: 15px 0;
            font-weight: bold;
            border: 1px solid #d3000040;
          }
          .link-box {
            background-color: #faf5f5;
            padding: 15px;
            border-radius: 4px;
            word-break: break-all;
            margin: 15px 0;
            text-align: center;
            border: 1px solid #d3000020;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
          }
          .platform-link {
            display: inline-block;
            padding: 10px 20px;
            background-color: #d30000;
            border: 1px solid #d30000;
            border-radius: 5px;
            margin: 15px 0;
            text-decoration: none !important;
            color: white !important;
            font-weight: bold;
          }
          .platform-link:hover {
            background-color: #a82020;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🚀 Artigo Publicado com Sucesso!</h2>
          </div>
          <div class="content">
            <div class="success-badge">
              ✅ Seu artigo foi publicado e está disponível online
            </div>
            
            <p>O artigo foi publicado com sucesso e já está disponível para visualização.</p>
            
            <div class="info-box">
              <h3>📋 Informações do Pedido</h3>
              <p><strong>Usuário:</strong> ${data.userName}</p>
              <p><strong>ID do Pedido:</strong> ${data.shortOrderId}</p>
              <p><strong>Item:</strong> <a href="${data.productUrl}" target="_blank">${data.productName}</a></p>
            </div>

            <div class="info-box">
              <h3>🔗 Artigo Publicado</h3>
              <p><strong>URL do Artigo:</strong></p>
              <div class="link-box">
                <a href="${data.publishedUrl}" target="_blank">${data.publishedUrl}</a>
              </div>
            </div>

            <p>Obrigado por usar nossos serviços! Seu artigo está agora disponível online.</p>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="http://cp.suaimprensa.com.br/orders/${data.orderId}" class="platform-link" target="_blank">
                Acessar Pedido
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>Este é um email automático do sistema Marketplace Sua Imprensa.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return { subject, html };
  }
}
