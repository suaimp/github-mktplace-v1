/**
 * Busca todos os dados brutos do canal do YouTube pela channelId usando a YouTube Data API v3.
 * @param channelId string
 * @param apiKey string
 * @returns any | null
 */
export async function fetchYoutubeChannelInfo(channelId: string, apiKey: string): Promise<any | null> {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings,topicDetails&id=${channelId}&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const item = data.items?.[0];
  if (!item) return null;
  return item;
}
