export type DiscoveryProfile = {
  id: string;
  handle: string;
  displayName: string;
  city: string;
  intent: string;
  bio: string;
  compatibility: number;
  trustScore: number;
  tags: string[];
  lastActive: string;
  avatarTone: string;
};
