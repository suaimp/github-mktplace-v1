// Serviço para resolver username ou handle em channelId usando a API do YouTube
import type { YoutubeUrlExtraction } from '../utils/extractChannelId';

export async function resolveChannelId(
  extracted: Exclude<YoutubeUrlExtraction, string>,
  apiKey: string
): Promise<string | null> {
  if (extracted.type === 'username') {
    // Consulta API para username antigo
    const url = `https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=${extracted.value}&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.items?.[0]?.id || null;
  } else if (extracted.type === 'handle') {
    // Consulta API para handle (@)
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${extracted.value}&type=channel&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.items?.[0]?.id?.channelId || null;
  }
  return null;
}
