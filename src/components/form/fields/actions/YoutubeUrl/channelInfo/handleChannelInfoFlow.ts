// Função para orquestrar o fluxo: dado um channelId, busca os dados do canal e exibe no console
import { fetchYoutubeChannelInfo } from './fetchYoutubeChannelInfo';

export async function handleChannelInfoFlow(channelId: string, apiKey: string) {
  if (!channelId) return null;
  const info = await fetchYoutubeChannelInfo(channelId, apiKey);
  if (info) {
    console.log('[YoutubeUrl] Dados brutos do canal extraídos:', info);
    return info;
  } else {
    console.error('[YoutubeUrl] Não foi possível obter os dados do canal.');
    return null;
  }
}
