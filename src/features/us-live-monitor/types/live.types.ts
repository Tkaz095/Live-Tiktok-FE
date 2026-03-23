// Shared types for LiveColumn feature

export interface ChatItem {
  id: string;
  user: string;
  message: string;
  avatar?: string;
}

export interface GiftItem {
  id: string;
  user: string;
  giftName: string;
  amount: number;
  value: number;
  icon: string;
  isBigGift: boolean;
}

export interface TikTokChatData {
  id?: string;
  user?: string;
  username?: string;
  message?: string;
  chatCount?: number;
  avatar?: string;
}

export interface TikTokGiftData {
  id?: string;
  username?: string;
  user?: string;
  giver?: string;
  name?: string;
  gift_name?: string;
  icon?: string;
  giftPictureUrl?: string;
  image?: string;
  count?: number;
  diamond_value?: number;
  coin_value?: number;
  value?: number;
  totalCoins?: number;
}

export interface RoomInfoData {
  viewerCount?: number;
  likeCount?: number;
  totalCoins?: number;
  chatCount?: number;
  hostNickname?: string;
  hostAvatar?: string;
  hostFollowers?: number;
}

export interface LiveStatsData {
  followers?: number;
  viewer_count?: number;
  likes?: number;
  like_count?: number;
}

export interface MemberCountData {
  count?: number;
}

export interface LikeData {
  totalLikeCount?: number;
  likeCount?: number;
}
