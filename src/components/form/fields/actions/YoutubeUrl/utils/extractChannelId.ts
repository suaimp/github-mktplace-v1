// Função utilitária para extrair o tipo e valor da URL do YouTube
// Retorna string (channelId) ou objeto { type, value }
export type YoutubeUrlExtraction =
  | string // channelId direto
  | { type: 'username' | 'handle'; value: string };

export function extractChannelId(url: string): YoutubeUrlExtraction | null {
  const channelRegex = /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/;
  const userRegex = /youtube\.com\/user\/([a-zA-Z0-9_-]+)/;
  const handleRegex = /youtube\.com\/@([a-zA-Z0-9_-]+)/;

  let match;
  if ((match = url.match(channelRegex))) {
    return match[1]; // Channel ID direto
  } else if ((match = url.match(userRegex))) {
    return { type: 'username', value: match[1] };
  } else if ((match = url.match(handleRegex))) {
    return { type: 'handle', value: match[1] };
  }
  return null; // URL inválida
}
