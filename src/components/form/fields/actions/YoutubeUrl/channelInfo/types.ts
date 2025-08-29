// Interface para dados do canal do YouTube
export interface YoutubeChannelInfo {
  id: string;
  title: string;
  description: string;
  subscriberCount: number;
  logoUrl: string;
  viewCount: number;
  videoCount: number;
  commentCount: number;
}
