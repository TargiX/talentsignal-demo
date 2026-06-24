import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import type {
  ApiStatus,
  DemoMessage,
  DemoWorkspaceActionResponse,
  DemoWorkspaceState,
  DiscoveryProfile,
  ModerationAction,
  ModerationDecision,
  ModerationItem
} from "~/composables/useApi";

type SortMode = "compatibility" | "trust" | "recent";

export const useDiscoveryStore = defineStore("discovery", () => {
  const { request } = useApi();
  const profiles = ref<DiscoveryProfile[]>([]);
  const selectedId = ref<string | null>(null);
  const status = ref("idle");
  const likeState = ref("Like profile");
  const apiStatus = ref<ApiStatus | null>(null);
  const moderationQueue = ref<ModerationItem[]>([]);
  const moderationHistory = ref<ModerationDecision[]>([]);
  const workspaceState = ref<DemoWorkspaceState | null>(null);
  const searchQuery = ref("");
  const filters = reactive({
    intent: "",
    city: "",
    sort: "compatibility" as SortMode
  });

  const activityItems = computed(() => workspaceState.value?.activities ?? []);
  const signaledProfileIds = computed(() => workspaceState.value?.signaledProfileIds ?? []);
  const bookmarkedProfileIds = computed(() => workspaceState.value?.bookmarkedProfileIds ?? []);
  const unreadCount = computed(() => workspaceState.value?.unreadCount ?? 0);

  const selectedProfile = computed(() => {
    return profiles.value.find((profile) => profile.id === selectedId.value) ?? profiles.value[0] ?? null;
  });

  async function bootstrap() {
    await Promise.all([refresh(), loadHealth(), loadModeration(), loadWorkspace()]);
  }

  async function refresh() {
    status.value = "loading";
    const query = new URLSearchParams();

    if (filters.intent) {
      query.set("intent", filters.intent);
    }

    if (filters.city) {
      query.set("city", filters.city);
    }

    query.set("sort", filters.sort);

    profiles.value = await request<DiscoveryProfile[]>(`/profiles/discover?${query.toString()}`);
    selectedId.value = profiles.value[0]?.id ?? null;
    status.value = "synced";
  }

  async function loadHealth() {
    apiStatus.value = await request<ApiStatus>("/health");
  }

  async function loadModeration() {
    const [queue, history] = await Promise.all([
      request<ModerationItem[]>("/moderation/queue"),
      request<ModerationDecision[]>("/moderation/history")
    ]);
    moderationQueue.value = queue;
    moderationHistory.value = history;
  }

  async function reviewModerationItem(itemId: string, action: ModerationAction, note?: string) {
    const response = await request<{
      queue: ModerationItem[];
      history: ModerationDecision[];
    }>(`/moderation/${itemId}/review`, {
      method: "POST",
      body: { action, note }
    });
    moderationQueue.value = response.queue;
    moderationHistory.value = response.history;
  }

  async function loadWorkspace() {
    workspaceState.value = await request<DemoWorkspaceState>("/workspace");
  }

  async function searchProfiles() {
    const normalized = searchQuery.value.trim();

    if (!normalized) {
      await refresh();
      return;
    }

    status.value = "loading";
    const query = new URLSearchParams({ q: normalized });
    profiles.value = await request<DiscoveryProfile[]>(`/search/profiles?${query.toString()}`);
    selectedId.value = profiles.value[0]?.id ?? null;
    status.value = "synced";
  }

  function selectProfile(profileId: string) {
    selectedId.value = profileId;
    likeState.value = "Like profile";
  }

  async function likeSelectedProfile() {
    if (!selectedProfile.value) {
      return;
    }

    likeState.value = "Saving...";
    const response = await request<{ nextStep: string }>(`/matches/${selectedProfile.value.id}/like`, {
      method: "POST",
      body: {
        note: `Interested in ${selectedProfile.value.intent}`
      }
    });
    likeState.value = response.nextStep;
  }

  async function sendMessage(profileId: string, body: string) {
    const response = await request<DemoWorkspaceActionResponse<{ message: DemoMessage }>>(
      `/workspace/messages/${profileId}`,
      {
        method: "POST",
        body: { body }
      }
    );

    workspaceState.value = response.state;
    return response.message;
  }

  async function sendSignal(profileId: string) {
    const response = await request<DemoWorkspaceActionResponse<{ profileId: string; status: "sent" | "already_sent" }>>(
      `/workspace/signals/${profileId}`,
      {
        method: "POST"
      }
    );

    workspaceState.value = response.state;
    return response;
  }

  async function toggleBookmark(profileId: string) {
    const response = await request<DemoWorkspaceActionResponse<{ profileId: string; bookmarked: boolean }>>(
      `/workspace/bookmarks/${profileId}/toggle`,
      {
        method: "POST"
      }
    );

    workspaceState.value = response.state;
    return response;
  }

  return {
    profiles,
    selectedProfile,
    status,
    apiStatus,
    moderationQueue,
    moderationHistory,
    workspaceState,
    activityItems,
    signaledProfileIds,
    bookmarkedProfileIds,
    unreadCount,
    searchQuery,
    filters,
    likeState,
    bootstrap,
    refresh,
    loadWorkspace,
    reviewModerationItem,
    searchProfiles,
    selectProfile,
    likeSelectedProfile,
    sendMessage,
    sendSignal,
    toggleBookmark
  };
});
