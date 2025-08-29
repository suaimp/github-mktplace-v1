// Responsável por receber a URL do input e iniciar o fluxo de extração do Channel ID

import { extractChannelId } from './utils/extractChannelId.ts';
import { resolveChannelId } from './services/resolveChannelId.ts';

export async function getYoutubeChannelIdFromUrl(url: string, apiKey?: string): Promise<string | null> {
  try {
    const YOUTUBE_API_KEY = apiKey || import.meta.env.VITE_YOUTUBE_API_KEY;
    const result = extractChannelId(url);
    console.log('[YoutubeUrl] Extração:', result);
    if (!result) {
      console.error('[YoutubeUrl] Erro: URL inválida ou não reconhecida:', url);
      return null;
    }

    if (typeof result === 'string') {
      // Já é o channelId
      return result;
    }

    // Precisa resolver via API
    const channelId = await resolveChannelId(result, YOUTUBE_API_KEY);
    if (!channelId) {
      console.error('[YoutubeUrl] Erro ao resolver channelId via API:', result);
    }
    return channelId;
  } catch (err) {
    console.error('[YoutubeUrl] Erro inesperado:', err);
    return null;
  }
}
