export type ApiStatus = {
  ok: boolean;
  app: string;
  domain: string;
  mysql: string;
  redis: string;
  dynamodb: string;
  opensearch: string;
};

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

export type DemoActivityType = "like" | "view" | "message" | "profile" | "online" | "signal" | "bookmark";

export type DemoActivityItem = {
  id: string;
  type: DemoActivityType;
  label: string;
  meta: string;
  profileId?: string;
};

export type DemoMessage = {
  id: string;
  profileId: string;
  profileName: string;
  body: string;
  status: "queued" | "sent";
  createdAt: string;
};

export type DemoWorkspaceState = {
  activities: DemoActivityItem[];
  signaledProfileIds: string[];
  bookmarkedProfileIds: string[];
  messages: DemoMessage[];
  unreadCount: number;
};

export type DemoWorkspaceActionResponse<TPayload = Record<string, never>> = TPayload & {
  state: DemoWorkspaceState;
};

export type ModerationItem = {
  id: string;
  type: string;
  severity: string;
  summary: string;
  age: string;
};

export type ModerationAction = "approve" | "escalate" | "dismiss";

export type ModerationDecision = ModerationItem & {
  action: ModerationAction;
  reviewedAt: string;
};

export type ModerationReviewResponse = {
  decision: ModerationDecision;
  queue: ModerationItem[];
  history: ModerationDecision[];
};

export function useApi() {
  const config = useRuntimeConfig();

  const request = async <T>(path: string, options: Parameters<typeof $fetch<T>>[1] = {}) => {
    const primaryBase = String(config.public.apiBase || "").replace(/\/$/, "");
    const fallbackBase = "https://api.charforge.art";
    const bases = [primaryBase, fallbackBase].filter((base, index, items) => base && items.indexOf(base) === index);
    let lastError: unknown;

    for (const base of bases) {
      try {
        return await $fetch<T>(`${base}/api${path}`, {
          ...options,
          headers: {
            Authorization: "Bearer demo-token",
            ...options.headers
          }
        });
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  };

  return { request };
}
