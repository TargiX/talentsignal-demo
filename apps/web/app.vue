<script setup lang="ts">
import {
  Activity,
  Bell,
  Bookmark,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleUserRound,
  Code2,
  FileText,
  Globe2,
  Heart,
  Inbox,
  LayoutList,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  MoreVertical,
  PanelsTopLeft,
  Search,
  Send,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  X,
  UserRoundCheck,
  Users,
  Zap
} from "@lucide/vue";
import { storeToRefs } from "pinia";
import { computed, onMounted, reactive, ref } from "vue";
import type { Component } from "vue";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { DemoActivityType } from "~/composables/useApi";
import { useDiscoveryStore } from "~/stores/discovery";

const discovery = useDiscoveryStore();
const {
  profiles,
  selectedProfile,
  status,
  apiStatus,
  filters,
  activityItems,
  bookmarkedProfileIds,
  moderationHistory,
  moderationQueue,
  searchQuery,
  signaledProfileIds,
  unreadCount
} = storeToRefs(discovery);

const mobileNavOpen = ref(false);
const activeNav = ref("Discover");

const discoverFilters = reactive({
  skill: "all",
  interest: "all",
  location: "all",
  availability: "all",
  verified: "all"
});
const messageModalOpen = ref(false);
const messageDraft = ref("");
const messageStatus = ref<"idle" | "sending" | "sent" | "error">("idle");
const signalBusyProfileId = ref<string | null>(null);
const bookmarkBusyProfileId = ref<string | null>(null);
const activeProfileTab = ref("compatibility");
const shareStatus = ref<"idle" | "copied">("idle");
const discoverPanel = ref(null);
const moderationBusyId = ref<string | null>(null);
const webhookStatus = ref<"idle" | "delivered">("idle");
const settingsState = reactive({
  asyncDigest: true,
  profileVisible: true,
  webhooksEnabled: true
});

type NavItem = {
  label: string;
  icon: Component;
  badge?: string;
  tone?: "red";
  dot?: boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: "Discover",
    items: [
      { label: "Discover", icon: PanelsTopLeft },
      { label: "Matches", icon: Heart, badge: "12" },
      { label: "Signals", icon: Activity },
      { label: "Search intent", icon: Search }
    ]
  },
  {
    label: "Trust & Safety",
    items: [
      { label: "Review queue", icon: Inbox, badge: "5", tone: "red" },
      { label: "Reports", icon: FileText }
    ]
  },
  {
    label: "Realtime",
    items: [
      { label: "Activity feed", icon: LayoutList, dot: true },
      { label: "Online now", icon: Users, badge: "24" }
    ]
  },
  {
    label: "Developer",
    items: [
      { label: "API status", icon: Code2 },
      { label: "Webhooks", icon: Zap },
      { label: "Changelog", icon: FileText }
    ]
  }
];

const footerNav = [
  { label: "Settings", icon: Settings },
  { label: "Docs", icon: FileText },
  { label: "Logout", icon: LogOut }
];

type ProfileVisual = {
  avatar: string;
  role: string;
  shortCity: string;
  online: boolean;
};

const linaVisual: ProfileVisual = {
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=220&q=85",
  role: "Product Designer",
  shortCity: "Berlin, DE",
  online: true
};

const visuals: Record<string, ProfileVisual> = {
  "pf-lina": linaVisual,
  "pf-mateo": {
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=220&q=85",
    role: "Frontend Engineer",
    shortCity: "Madrid, ES",
    online: false
  },
  "pf-aisha": {
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=220&q=85",
    role: "Backend Engineer",
    shortCity: "Lagos, NG",
    online: true
  },
  "pf-ethan": {
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=220&q=85",
    role: "DevOps Engineer",
    shortCity: "Singapore",
    online: false
  },
  "pf-sofia": {
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=220&q=85",
    role: "Product Manager",
    shortCity: "Milan, IT",
    online: false
  }
};

const fallbackProfiles = [
  {
    id: "loading-lina",
    handle: "lina.park",
    displayName: "Lina Park",
    city: "Berlin, Germany",
    intent: "Looking to collaborate on a project",
    bio: "Product designer with 6+ years of experience building user-centered products for B2B SaaS and marketplaces. Passionate about design systems, accessibility, and creating delightful user experiences.",
    compatibility: 92,
    trustScore: 96,
    tags: ["Figma", "User Research", "Design Systems", "Prototyping", "Accessibility"],
    lastActive: "Online now",
    avatarTone: "coral"
  }
];

const rawProfiles = computed(() => (profiles.value.length ? profiles.value : fallbackProfiles));
const profileList = computed(() => {
  return rawProfiles.value.filter((profile) => {
    const tags = profile.tags.join(" ").toLowerCase();
    const role = profileRole(profile.id).toLowerCase();
    const searchArea = `${tags} ${role} ${profile.intent}`.toLowerCase();
    const skillMatch =
      discoverFilters.skill === "all" || searchArea.includes(discoverFilters.skill.toLowerCase());
    const interestMatch =
      discoverFilters.interest === "all" || searchArea.includes(discoverFilters.interest.toLowerCase());
    const locationMatch =
      discoverFilters.location === "all" || profile.city.toLowerCase().includes(discoverFilters.location.toLowerCase());
    const availabilityMatch =
      discoverFilters.availability === "all" ||
      (discoverFilters.availability === "online" && hasOnlineStatus(profile.id)) ||
      (discoverFilters.availability === "recent" && !hasOnlineStatus(profile.id));
    const verifiedMatch =
      discoverFilters.verified === "all" ||
      (discoverFilters.verified === "verified" && profile.trustScore >= 90);

    return skillMatch && interestMatch && locationMatch && availabilityMatch && verifiedMatch;
  });
});
const activeProfile = computed(() => {
  const selected = selectedProfile.value;

  if (selected && profileList.value.some((profile) => profile.id === selected.id)) {
    return selected;
  }

  return profileList.value[0] ?? null;
});
const activeVisual = computed(() => {
  const profile = activeProfile.value;

  return profile ? visuals[profile.id] ?? linaVisual : linaVisual;
});

const isLoading = computed(() => status.value === "loading" || status.value === "idle");
const apiHealthLabel = computed(() => {
  return apiStatus.value ? "All systems operational" : "Checking systems";
});

const compatibilityRows = [
  { label: "Skills overlap", value: 95 },
  { label: "Interests alignment", value: 90 },
  { label: "Work style", value: 88 },
  { label: "Communication", value: 93 },
  { label: "Location fit", value: 85 }
];

const trustItems = [
  "Email verified",
  "ID verified",
  "Portfolio linked",
  "Community vouch"
];

const activityStyleMap: Record<DemoActivityType, { icon: Component; tone: string }> = {
  like: { icon: Heart, tone: "text-red-500" },
  view: { icon: UserRoundCheck, tone: "text-indigo-500" },
  message: { icon: MessageCircle, tone: "text-slate-600" },
  profile: { icon: CircleUserRound, tone: "text-slate-600" },
  online: { icon: Activity, tone: "text-emerald-600" },
  signal: { icon: Zap, tone: "text-[#ef4f45]" },
  bookmark: { icon: Bookmark, tone: "text-slate-600" }
};
const realtimeActivityItems = computed(() => {
  return activityItems.value.map((item) => ({
    ...item,
    icon: activityStyleMap[item.type]?.icon ?? Activity,
    tone: activityStyleMap[item.type]?.tone ?? "text-slate-600"
  }));
});
const notificationCount = computed(() => unreadCount.value);

const onlineUsers = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=80&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=80&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=80&q=80",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=80&q=80",
  "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=80&q=80"
];

const suggestedSignals = [
  { label: "UX Research Study", meta: "Looking for participants", count: 12, tone: "bg-red-50 text-red-500" },
  { label: "Open Source Contributors", meta: "Collaboration opportunity", count: 7, tone: "bg-blue-50 text-blue-500" },
  { label: "No-code Builders", meta: "Project collaboration", count: 5, tone: "bg-amber-50 text-amber-500" }
];

const apiStatusRows = computed(() => {
  const statusValue = apiStatus.value;

  return [
    { label: "API", value: statusValue?.ok ? "Operational" : "Checking" },
    { label: "MySQL", value: statusValue?.mysql ?? "checking" },
    { label: "Redis", value: statusValue?.redis ?? "checking" },
    { label: "DynamoDB", value: statusValue?.dynamodb ?? "checking" },
    { label: "OpenSearch", value: statusValue?.opensearch ?? "checking" }
  ];
});

const matchedProfiles = computed(() => {
  const selectedIds = new Set([...signaledProfileIds.value, ...bookmarkedProfileIds.value]);
  const selected = rawProfiles.value.filter((profile) => selectedIds.has(profile.id));

  return selected.length ? selected : rawProfiles.value.slice(0, 3);
});

const onlineProfiles = computed(() => rawProfiles.value.filter((profile) => hasOnlineStatus(profile.id)));

const operationCopy: Record<string, { title: string; description: string }> = {
  Matches: {
    title: "Matches",
    description: "Profiles you have signaled, saved, or should review next."
  },
  Signals: {
    title: "Signals",
    description: "Collaboration opportunities that can become discovery actions."
  },
  "Search intent": {
    title: "Search intent",
    description: "Run demo searches against the NestJS search endpoint."
  },
  "Review queue": {
    title: "Review queue",
    description: "Moderate flagged profile and trust events from the API queue."
  },
  Reports: {
    title: "Reports",
    description: "A compact operational snapshot for async team updates."
  },
  "Activity feed": {
    title: "Activity feed",
    description: "API-backed realtime events from messages, signals, bookmarks, and profile activity."
  },
  "Online now": {
    title: "Online now",
    description: "Currently available profiles from the seeded discovery data."
  },
  "API status": {
    title: "API status",
    description: "Live health information from the NestJS backend."
  },
  Webhooks: {
    title: "Webhooks",
    description: "Demo webhook delivery settings and test event."
  },
  Changelog: {
    title: "Changelog",
    description: "Product increments shipped in this portfolio demo."
  },
  Settings: {
    title: "Settings",
    description: "Reviewer-facing preferences for the demo workspace."
  },
  Docs: {
    title: "Docs",
    description: "Fast links and local instructions for reviewing the project."
  },
  Logout: {
    title: "Logout",
    description: "Demo session state for the guarded API."
  }
};

const activeOperation = computed(() => {
  return operationCopy[activeNav.value] ?? operationCopy.Discover ?? {
    title: activeNav.value,
    description: "Demo workspace"
  };
});

const portfolioItems = [
  { title: "Design systems audit", meta: "B2B SaaS · Accessibility", stat: "18 shipped components" },
  { title: "Marketplace onboarding", meta: "Discovery to activation", stat: "+24% profile completion" },
  { title: "Research ops dashboard", meta: "Realtime collaboration", stat: "7 teams aligned" }
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function hasOnlineStatus(profileId: string) {
  return visuals[profileId]?.online ?? false;
}

function profileRole(profileId: string) {
  return visuals[profileId]?.role ?? "Full-Stack Engineer";
}

function profileCity(profileId: string, fallback: string) {
  return visuals[profileId]?.shortCity ?? fallback;
}

function profileAvatar(profileId: string) {
  return visuals[profileId]?.avatar ?? linaVisual.avatar;
}

function updateLocationFilter(value: string) {
  discoverFilters.location = value;
  filters.value.city = value === "all" ? "" : value;
  void discovery.refresh();
}

function clearDiscoverFilters() {
  discoverFilters.skill = "all";
  discoverFilters.interest = "all";
  discoverFilters.location = "all";
  discoverFilters.availability = "all";
  discoverFilters.verified = "all";
  filters.value.city = "";
  filters.value.sort = "compatibility";
  void discovery.refresh();
}

function navBadge(item: NavItem) {
  if (item.label === "Review queue") {
    return String(moderationQueue.value.length);
  }

  if (item.label === "Matches") {
    return String(matchedProfiles.value.length);
  }

  if (item.label === "Online now") {
    return String(onlineProfiles.value.length);
  }

  return item.badge;
}

function setActiveNav(label: string) {
  activeNav.value = label;
  mobileNavOpen.value = false;
}

function selectProfile(profileId: string) {
  discovery.selectProfile(profileId);
  activeProfileTab.value = "compatibility";
}

function openProfile(profileId: string) {
  setActiveNav("Discover");
  selectProfile(profileId);
}

function backToDiscover() {
  const panel = discoverPanel.value as { scrollIntoView: (options: { behavior: "smooth"; block: "nearest"; inline: "start" }) => void } | null;
  panel?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
}

function showActivity() {
  setActiveNav("Discover");
  activeProfileTab.value = "activity";
}

function showOnlineProfiles() {
  discoverFilters.availability = "online";
  backToDiscover();
}

async function shareProfile() {
  if (!activeProfile.value) {
    return;
  }

  const url = new globalThis.URL("/", globalThis.location?.origin ?? "https://charforge-web.vercel.app");
  url.searchParams.set("profile", activeProfile.value.handle);

  try {
    await globalThis.navigator?.clipboard?.writeText(url.toString());
  } catch {
    // Local preview can run without clipboard permissions; the visible copied state is still useful for the demo.
  }

  shareStatus.value = "copied";
  globalThis.setTimeout(() => {
    shareStatus.value = "idle";
  }, 1800);
}

async function reviewModeration(itemId: string, action: "approve" | "escalate" | "dismiss") {
  moderationBusyId.value = itemId;

  try {
    await discovery.reviewModerationItem(itemId, action, `${action} from portfolio demo`);
  } finally {
    moderationBusyId.value = null;
  }
}

function searchIntent(value: string) {
  searchQuery.value = value;
  setActiveNav("Discover");
  void discovery.searchProfiles();
}

function testWebhook() {
  webhookStatus.value = "delivered";
  globalThis.setTimeout(() => {
    webhookStatus.value = "idle";
  }, 2200);
}

function cycleSortMode() {
  const sortModes = ["compatibility", "trust", "recent"] as const;
  const currentIndex = sortModes.indexOf(filters.value.sort);
  filters.value.sort = sortModes[(currentIndex + 1) % sortModes.length] ?? "compatibility";
  void discovery.refresh();
}

function openMessageModal() {
  if (!activeProfile.value) {
    return;
  }

  messageDraft.value = `Hi ${activeProfile.value.displayName.split(" ")[0]}, I liked your ${activeProfile.value.intent.toLowerCase()} profile. Want to compare notes this week?`;
  messageStatus.value = "idle";
  messageModalOpen.value = true;
}

async function sendMessage() {
  if (!activeProfile.value || !messageDraft.value.trim()) {
    return;
  }

  messageStatus.value = "sending";

  try {
    await discovery.sendMessage(activeProfile.value.id, messageDraft.value);
    messageStatus.value = "sent";
  } catch {
    messageStatus.value = "error";
  }
}

async function sendSignal() {
  if (!activeProfile.value) {
    return;
  }

  signalBusyProfileId.value = activeProfile.value.id;

  try {
    await discovery.sendSignal(activeProfile.value.id);
  } finally {
    signalBusyProfileId.value = null;
  }
}

async function toggleBookmark() {
  if (!activeProfile.value) {
    return;
  }

  bookmarkBusyProfileId.value = activeProfile.value.id;

  try {
    await discovery.toggleBookmark(activeProfile.value.id);
  } finally {
    bookmarkBusyProfileId.value = null;
  }
}

function isSignaled(profileId: string) {
  return signaledProfileIds.value.includes(profileId);
}

function isBookmarked(profileId: string) {
  return bookmarkedProfileIds.value.includes(profileId);
}

onMounted(async () => {
  await discovery.bootstrap();

  const sharedHandle = new globalThis.URLSearchParams(globalThis.location.search).get("profile");
  const sharedProfile = sharedHandle
    ? profiles.value.find((profile) => profile.handle === sharedHandle)
    : null;

  if (sharedProfile) {
    selectProfile(sharedProfile.id);
  }
});
</script>

<template>
  <TooltipProvider>
    <main class="min-h-screen bg-[#fbfcfb] text-[#151a19]">
      <div class="grid min-h-screen grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside class="hidden border-r border-[#e7ece9] bg-white lg:flex lg:flex-col">
          <div class="flex h-16 items-center gap-3 border-b border-[#e7ece9] px-6">
            <img src="/charforge-mark.svg" alt="" class="size-9" />
            <span class="text-xl font-semibold tracking-tight">TalentSignal</span>
          </div>

          <div class="flex items-center gap-3 px-6 py-6">
            <Avatar class="size-10">
              <AvatarImage src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80" alt="" />
              <AvatarFallback>DJ</AvatarFallback>
            </Avatar>
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold">devjohn</p>
              <p class="text-xs text-[#64706c]">Full-Stack Engineer</p>
            </div>
          </div>

          <ScrollArea class="min-h-0 flex-1 px-4">
            <nav class="grid gap-8 pb-7 pt-3">
              <section v-for="group in navGroups" :key="group.label" class="grid gap-2.5">
                <p class="px-2 text-[11px] font-bold uppercase tracking-[0.06em] text-[#7a8581]">
                  {{ group.label }}
                </p>
                <div class="grid gap-1.5">
                  <button
                    v-for="item in group.items"
                    :key="item.label"
                    type="button"
                    class="flex h-10 items-center gap-3.5 rounded-md px-3.5 text-left text-[13px] font-semibold leading-none text-[#3f4a46] transition-colors hover:bg-[#f4f7f5]"
                    :class="activeNav === item.label ? 'bg-[#e6f5ee] text-[#07945c]' : ''"
                    @click="setActiveNav(item.label)"
                  >
                    <component :is="item.icon" class="size-[17px] shrink-0 stroke-[1.85]" />
                    <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
                    <span v-if="item.dot" class="size-2 rounded-full bg-[#10a66a]" />
                    <span
                      v-if="navBadge(item)"
                      class="grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold leading-none text-white"
                      :class="item.tone === 'red' ? 'bg-[#ef4f45]' : 'bg-[#10a66a]'"
                    >
                      {{ navBadge(item) }}
                    </span>
                  </button>
                </div>
              </section>
            </nav>
          </ScrollArea>

          <div class="border-t border-[#eef2f0] p-4">
            <button
              v-for="item in footerNav"
              :key="item.label"
              type="button"
              class="flex h-10 w-full items-center gap-3.5 rounded-md px-3.5 text-[13px] font-semibold leading-none text-[#4b5652] hover:bg-[#f4f7f5]"
              :class="activeNav === item.label ? 'bg-[#e6f5ee] text-[#07945c]' : ''"
              @click="setActiveNav(item.label)"
            >
              <component :is="item.icon" class="size-[17px] stroke-[1.85]" />
              {{ item.label }}
            </button>
            <p class="mt-7 px-3 text-xs leading-5 text-[#7a8581]">2024 TalentSignal<br />v0.1.0-demo</p>
          </div>
        </aside>

        <section class="min-w-0">
          <header class="grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-[#e7ece9] bg-white px-4 sm:px-6">
            <div class="flex min-w-0 items-center gap-3">
              <Sheet v-model:open="mobileNavOpen">
                <SheetTrigger as-child>
                  <Button class="lg:hidden" variant="outline" size="icon" aria-label="Open navigation">
                    <Menu class="size-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" class="w-[290px] bg-white">
                  <SheetHeader>
                    <SheetTitle class="flex items-center gap-3">
                      <img src="/charforge-mark.svg" alt="" class="size-9" />
                      TalentSignal
                    </SheetTitle>
                    <SheetDescription>Social discovery operations.</SheetDescription>
                  </SheetHeader>
                  <nav class="mt-7 grid gap-5">
                    <section v-for="group in navGroups" :key="group.label" class="grid gap-1">
                      <p class="px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[#7a8581]">{{ group.label }}</p>
                      <button
                        v-for="item in group.items"
                        :key="item.label"
                        type="button"
                        class="rounded-md px-3 py-2 text-left text-sm font-semibold text-[#34413d]"
                        :class="activeNav === item.label ? 'bg-[#e6f5ee] text-[#07945c]' : ''"
                        @click="setActiveNav(item.label)"
                      >
                        {{ item.label }}
                      </button>
                    </section>
                  </nav>
                </SheetContent>
              </Sheet>

              <label class="relative hidden w-full max-w-[402px] md:block">
                <Search class="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#7a8581]" />
                <Input
                  v-model="searchQuery"
                  class="h-10 rounded-md border-[#e0e6e3] bg-white pl-11 pr-10 text-sm shadow-sm"
                  placeholder="Search intent, tags, or @username"
                  @keyup.enter="discovery.searchProfiles()"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-[#dce4e0] px-2 py-0.5 text-xs text-[#7a8581]">
                  /
                </span>
              </label>
            </div>

            <div class="flex items-center gap-3">
              <div class="hidden h-11 min-w-[156px] rounded-md border border-[#e2e8e5] bg-white px-3 py-2 text-xs shadow-sm md:block">
                <div class="flex items-center justify-between gap-2">
                  <span class="font-semibold">API status</span>
                  <span class="size-1.5 rounded-full bg-[#10a66a]" />
                </div>
                <p class="mt-0.5 text-[#64706c]">{{ apiHealthLabel }}</p>
              </div>
              <div class="hidden h-11 min-w-[112px] rounded-md border border-[#e2e8e5] bg-white px-3 py-2 text-xs shadow-sm md:block">
                <div class="flex items-center justify-between gap-2">
                  <span class="font-semibold">Realtime</span>
                  <span class="size-1.5 rounded-full bg-[#10a66a]" />
                </div>
                <p class="mt-0.5 text-[#64706c]">Connected</p>
              </div>
              <Button variant="ghost" size="icon" class="relative overflow-visible" aria-label="Notifications">
                <Bell class="size-5 text-[#151a19]" />
                <span class="absolute right-0.5 top-0.5 grid size-4 place-items-center rounded-full bg-[#ef4f45] text-[10px] font-bold leading-none text-white">{{ notificationCount }}</span>
              </Button>
              <Avatar class="size-9">
                <AvatarImage src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80" alt="" />
                <AvatarFallback>DJ</AvatarFallback>
              </Avatar>
              <button type="button" class="hidden items-center gap-2 text-sm font-medium sm:flex">
                devjohn
                <ChevronDown class="size-4 text-[#64706c]" />
              </button>
            </div>
          </header>

          <div v-if="activeNav === 'Discover'" class="grid min-h-[calc(100vh-4rem)] xl:grid-cols-[390px_minmax(520px,1fr)_300px]">
            <section ref="discoverPanel" class="border-r border-[#e7ece9] bg-white px-5 py-6">
              <div class="mb-5 flex items-center justify-between">
                <h1 class="text-lg font-semibold">Discover</h1>
                <Button variant="ghost" size="icon" class="size-7 text-[#34413d]" aria-label="Filter layout">
                  <SlidersHorizontal class="size-4" />
                </Button>
              </div>

              <div class="grid gap-5">
                <label class="grid gap-2">
                  <span class="text-[13px] font-semibold">Search intent</span>
                  <Select v-model="filters.intent" @update:model-value="discovery.refresh()">
                    <SelectTrigger class="h-8 w-full rounded-md border-[#dfe6e2] bg-white px-3 text-[11px] font-medium text-[#4f5c57]">
                      <SelectValue placeholder="Looking to collaborate on a project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Looking to collaborate on a project">Looking to collaborate on a project</SelectItem>
                        <SelectItem value="Frontend collaboration">Frontend collaboration</SelectItem>
                        <SelectItem value="Backend systems">Backend systems</SelectItem>
                        <SelectItem value="Product strategy">Product strategy</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </label>

                <div class="grid gap-2.5">
                  <div class="flex items-center justify-between">
                    <span class="text-[13px] font-semibold">Filters</span>
                    <button type="button" class="text-[11px] font-medium text-[#64706c]" @click="clearDiscoverFilters">
                      Clear all
                    </button>
                  </div>
                  <div class="grid grid-cols-[1.12fr_1fr_1.18fr] gap-2">
                    <label class="relative min-w-0">
                      <select v-model="discoverFilters.skill" class="h-[30px] w-full appearance-none rounded-md border border-[#dfe6e2] bg-white px-2 pr-5 text-[10px] font-semibold text-[#2f3a36] shadow-sm shadow-slate-900/[0.02] outline-none">
                        <option value="all">Skills</option>
                        <option value="design">Design</option>
                        <option value="vue">Vue</option>
                        <option value="nestjs">NestJS</option>
                        <option value="aws">AWS</option>
                      </select>
                      <ChevronDown class="pointer-events-none absolute right-2 top-1/2 size-2 -translate-y-1/2 text-[#7a8581]" />
                    </label>

                    <label class="relative min-w-0">
                      <select v-model="discoverFilters.interest" class="h-[30px] w-full appearance-none rounded-md border border-[#dfe6e2] bg-white px-2 pr-5 text-[10px] font-semibold text-[#2f3a36] shadow-sm shadow-slate-900/[0.02] outline-none">
                        <option value="all">Interests</option>
                        <option value="research">Research</option>
                        <option value="systems">Systems</option>
                        <option value="strategy">Strategy</option>
                        <option value="cloud">Cloud</option>
                      </select>
                      <ChevronDown class="pointer-events-none absolute right-2 top-1/2 size-2 -translate-y-1/2 text-[#7a8581]" />
                    </label>

                    <label class="relative min-w-0">
                      <select
                        v-model="discoverFilters.location"
                        class="h-[30px] w-full appearance-none rounded-md border border-[#dfe6e2] bg-white px-2 pr-5 text-[10px] font-semibold text-[#2f3a36] shadow-sm shadow-slate-900/[0.02] outline-none"
                        @change="updateLocationFilter(discoverFilters.location)"
                      >
                        <option value="all">Location</option>
                        <option value="Berlin">Berlin</option>
                        <option value="Madrid">Madrid</option>
                        <option value="Lagos">Lagos</option>
                        <option value="Singapore">Singapore</option>
                      </select>
                      <ChevronDown class="pointer-events-none absolute right-2 top-1/2 size-2 -translate-y-1/2 text-[#7a8581]" />
                    </label>

                    <label class="relative min-w-0">
                      <select v-model="discoverFilters.availability" class="h-[30px] w-full appearance-none rounded-md border border-[#dfe6e2] bg-white px-2 pr-5 text-[10px] font-semibold text-[#2f3a36] shadow-sm shadow-slate-900/[0.02] outline-none">
                        <option value="all">Availability</option>
                        <option value="online">Online now</option>
                        <option value="recent">Recently active</option>
                      </select>
                      <ChevronDown class="pointer-events-none absolute right-2 top-1/2 size-2 -translate-y-1/2 text-[#7a8581]" />
                    </label>

                    <label class="relative min-w-0">
                      <select v-model="discoverFilters.verified" class="h-[30px] w-full appearance-none rounded-md border border-[#dfe6e2] bg-white px-2 pr-5 text-[10px] font-semibold text-[#2f3a36] shadow-sm shadow-slate-900/[0.02] outline-none">
                        <option value="all">Verified</option>
                        <option value="verified">Trust 90+</option>
                      </select>
                      <ChevronDown class="pointer-events-none absolute right-2 top-1/2 size-2 -translate-y-1/2 text-[#7a8581]" />
                    </label>

                    <Button
                      variant="outline"
                      class="h-[30px] min-w-0 justify-between rounded-md border-[#dfe6e2] bg-white px-2 text-[10px] font-semibold text-[#2f3a36] shadow-sm shadow-slate-900/[0.02]"
                      @click="cycleSortMode"
                    >
                      <span>More filters</span>
                      <SlidersHorizontal class="size-2 shrink-0 text-[#7a8581]" />
                    </Button>
                  </div>
                </div>

                <div class="grid gap-3">
                  <p class="text-sm font-semibold">Top picks</p>
                  <div v-if="isLoading" class="grid gap-3">
                    <Skeleton v-for="item in 4" :key="item" class="h-[112px] rounded-md" />
                  </div>
                  <ScrollArea v-else class="h-[calc(100vh-22rem)] min-h-[470px] pr-3">
                    <div class="grid gap-3">
                      <div v-if="!profileList.length" class="rounded-md bg-[#f7f9f8] px-4 py-8 text-center">
                        <Search class="mx-auto size-5 text-[#7a8581]" />
                        <p class="mt-3 text-sm font-semibold">No profiles match</p>
                        <p class="mt-1 text-xs leading-5 text-[#64706c]">Clear filters or try a broader intent.</p>
                        <Button variant="outline" class="mt-4 h-8 rounded-md text-xs" @click="clearDiscoverFilters">
                          Clear filters
                        </Button>
                      </div>
                      <template v-else>
                        <button
                          v-for="profile in profileList"
                          :key="profile.id"
                          type="button"
                          class="grid rounded-md border bg-white p-3 text-left transition-colors hover:border-[#b6ded0]"
                          :class="activeProfile?.id === profile.id ? 'border-[#10a66a] shadow-sm' : 'border-[#e1e8e4]'"
                          @click="selectProfile(profile.id)"
                        >
                          <div class="flex gap-3">
                            <Avatar class="size-[72px] !rounded-md">
                              <AvatarImage :src="profileAvatar(profile.id)" alt="" class="!rounded-md object-cover" />
                              <AvatarFallback>{{ initials(profile.displayName) }}</AvatarFallback>
                            </Avatar>
                            <div class="min-w-0 flex-1 pt-0.5">
                              <div class="flex items-center gap-1.5">
                                <p class="truncate text-sm font-semibold">{{ profile.displayName }}</p>
                                <CheckCircle2 class="size-3.5 shrink-0 fill-[#10a66a] text-white" />
                              </div>
                              <p class="truncate text-xs text-[#4f5c57]">
                                {{ profileRole(profile.id) }} · {{ profileCity(profile.id, profile.city) }}
                              </p>
                              <div class="mt-2 flex flex-wrap gap-1.5">
                                <Badge v-for="tag in profile.tags.slice(0, 3)" :key="tag" variant="secondary" class="rounded border border-[#e0e7e3] bg-[#f7f9f8] px-2 py-0 text-[10px] font-medium text-[#36433f]">
                                  {{ tag }}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div class="mt-2 flex items-center gap-2 text-[11px] font-semibold text-[#0c9860]">
                            <span>{{ profile.compatibility }}% compatibility</span>
                            <span class="text-[#9aa6a1]">·</span>
                            <span>{{ hasOnlineStatus(profile.id) ? "Online now" : profile.lastActive }}</span>
                          </div>
                        </button>
                      </template>
                      <p v-if="profileList.length" class="mx-auto mt-1 flex h-9 items-center text-xs font-medium text-[#7a8581]">
                        All demo profiles loaded
                      </p>
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </section>

            <section v-if="activeProfile" class="min-w-0 bg-white">
              <div class="flex h-[62px] items-center justify-between border-b border-[#e7ece9] px-6">
                <button type="button" class="flex items-center gap-2 text-sm font-medium text-[#64706c]" @click="backToDiscover">
                  <span class="text-lg leading-none">&larr;</span>
                  Back to discover
                </button>
                <div class="flex items-center gap-5">
                  <button type="button" class="text-sm font-medium text-[#4f5c57]" @click="shareProfile">
                    {{ shareStatus === "copied" ? "Profile link copied" : "Share profile" }}
                  </button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical class="size-5" />
                  </Button>
                </div>
              </div>

              <div class="relative h-[174px] border-b border-[#e7ece9] bg-[#e8e2d8]">
                <img
                  src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1300&q=82"
                  alt=""
                  class="h-full w-full object-cover"
                />
              </div>

              <div class="relative border-b border-[#e7ece9] px-6 pb-5 pt-4">
                <Avatar class="absolute -top-[52px] left-6 size-[142px] !rounded-md border-4 border-white shadow-sm">
                  <AvatarImage :src="activeVisual.avatar" alt="" class="!rounded-md object-cover" />
                  <AvatarFallback>{{ initials(activeProfile.displayName) }}</AvatarFallback>
                </Avatar>
                <span class="absolute left-[148px] top-[-14px] size-5 rounded-full border-4 border-white bg-[#10a66a]" />

                <div class="ml-[164px] flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div class="flex items-center gap-2">
                      <h2 class="text-xl font-semibold">{{ activeProfile.displayName }}</h2>
                      <CheckCircle2 class="size-4 fill-[#10a66a] text-white" />
                    </div>
                    <p class="mt-1 flex flex-wrap items-center gap-3 text-sm text-[#4f5c57]">
                      <span>{{ activeVisual.role }}</span>
                      <span class="flex items-center gap-1"><MapPin class="size-3.5" />{{ activeProfile.city }}</span>
                    </p>
                    <div class="mt-3 flex flex-wrap gap-2">
                      <Badge class="rounded-md bg-[#e9f8f1] px-3 py-1 text-[#07945c] hover:bg-[#e9f8f1]">Online now</Badge>
                      <Badge class="rounded-md bg-[#e9f8f1] px-3 py-1 text-[#07945c] hover:bg-[#e9f8f1]">Open to new opportunities</Badge>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 pt-3">
                    <Button class="h-9 rounded-md bg-[#10a66a] px-5 text-white hover:bg-[#0b8e59]" @click="openMessageModal">
                      Message
                    </Button>
                    <Button
                      variant="outline"
                      class="h-9 rounded-md border-[#ffb6ad] px-4 text-[#ef4f45]"
                      :disabled="signalBusyProfileId === activeProfile.id"
                      @click="sendSignal"
                    >
                      <Zap class="size-4" />
                      {{ signalBusyProfileId === activeProfile.id ? "Sending" : isSignaled(activeProfile.id) ? "Signal Sent" : "Send Signal" }}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      :disabled="bookmarkBusyProfileId === activeProfile.id"
                      @click="toggleBookmark"
                    >
                      <Bookmark
                        class="size-5"
                        :class="isBookmarked(activeProfile.id) ? 'fill-[#10a66a] text-[#10a66a]' : 'text-[#7a8581]'"
                      />
                    </Button>
                  </div>
                </div>

                <div class="mt-7 flex flex-wrap gap-2">
                  <Badge v-for="tag in activeProfile.tags" :key="tag" variant="secondary" class="rounded-md border border-[#e0e7e3] bg-[#f7f9f8] px-3 py-1 text-xs text-[#3e4945]">
                    {{ tag }}
                  </Badge>
                  <Badge variant="secondary" class="rounded-md border border-[#e0e7e3] bg-[#f7f9f8] px-3 py-1 text-xs text-[#3e4945]">
                    +
                  </Badge>
                </div>
              </div>

              <Tabs v-model="activeProfileTab" class="px-6 pt-4">
                <TabsList class="h-[31px] w-auto justify-start gap-6 rounded-none border-0 bg-transparent p-0">
                  <TabsTrigger value="about" class="h-[31px] min-w-[78px] !flex-none rounded-none border-0 border-b-2 border-transparent bg-transparent px-2 pb-2 pt-0 text-sm font-medium leading-none data-[state=active]:border-b-[#10a66a] data-[state=active]:bg-transparent data-[state=active]:shadow-none">About</TabsTrigger>
                  <TabsTrigger value="compatibility" class="h-[31px] min-w-[112px] !flex-none rounded-none border-0 border-b-2 border-transparent bg-transparent px-2 pb-2 pt-0 text-sm font-medium leading-none data-[state=active]:border-b-[#10a66a] data-[state=active]:bg-transparent data-[state=active]:text-[#07945c] data-[state=active]:shadow-none">Compatibility</TabsTrigger>
                  <TabsTrigger value="activity" class="h-[31px] min-w-[78px] !flex-none rounded-none border-0 border-b-2 border-transparent bg-transparent px-2 pb-2 pt-0 text-sm font-medium leading-none data-[state=active]:border-b-[#10a66a] data-[state=active]:bg-transparent data-[state=active]:shadow-none">Activity</TabsTrigger>
                  <TabsTrigger value="portfolio" class="h-[31px] min-w-[82px] !flex-none rounded-none border-0 border-b-2 border-transparent bg-transparent px-2 pb-2 pt-0 text-sm font-medium leading-none data-[state=active]:border-b-[#10a66a] data-[state=active]:bg-transparent data-[state=active]:shadow-none">Portfolio</TabsTrigger>
                </TabsList>

                <TabsContent value="about" class="border-t border-[#e7ece9] py-6">
                  <div class="grid gap-6">
                    <div>
                      <h3 class="text-base font-semibold">About {{ activeProfile.displayName.split(" ")[0] }}</h3>
                      <p class="mt-2 max-w-[680px] text-sm leading-6 text-[#4f5c57]">{{ activeProfile.bio }}</p>
                    </div>
                    <div class="grid gap-4 md:grid-cols-3">
                      <div class="rounded-md bg-[#f7f9f8] p-4">
                        <p class="text-xs font-semibold text-[#64706c]">Preferred work</p>
                        <p class="mt-2 text-sm font-semibold">Async reviews, clear briefs</p>
                      </div>
                      <div class="rounded-md bg-[#f7f9f8] p-4">
                        <p class="text-xs font-semibold text-[#64706c]">Open to</p>
                        <p class="mt-2 text-sm font-semibold">{{ activeProfile.intent }}</p>
                      </div>
                      <div class="rounded-md bg-[#f7f9f8] p-4">
                        <p class="text-xs font-semibold text-[#64706c]">Trust score</p>
                        <p class="mt-2 text-sm font-semibold">{{ activeProfile.trustScore }}/100 verified</p>
                      </div>
                    </div>
                    <div class="flex flex-wrap gap-6 border-t border-[#e7ece9] pt-5 text-xs text-[#64706c]">
                      <span class="flex items-center gap-2"><CalendarDays class="size-4" />Joined May 2022</span>
                      <span class="flex items-center gap-2"><Users class="size-4" />37 connections</span>
                      <span class="flex items-center gap-2"><Globe2 class="size-4" />Speaks English, Korean</span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="compatibility" class="border-t border-[#e7ece9] py-6">
                  <div class="grid gap-8 lg:grid-cols-[180px_minmax(0,1fr)]">
                    <div class="grid justify-center gap-3 text-center">
                      <div class="compat-donut" :style="{ '--score': `${activeProfile.compatibility * 3.6}deg` }">
                        <span>{{ activeProfile.compatibility }}%</span>
                      </div>
                      <p class="text-xs text-[#64706c]">Overall compatibility</p>
                    </div>
                    <div class="grid content-center gap-4">
                      <div v-for="row in compatibilityRows" :key="row.label" class="grid gap-1.5">
                        <div class="flex items-center justify-between text-sm">
                          <span class="font-medium text-[#34413d]">{{ row.label }}</span>
                          <span class="text-[#64706c]">{{ row.value }}%</span>
                        </div>
                        <Progress :model-value="row.value" class="h-1.5 bg-[#e7ece9]" />
                      </div>
                    </div>
                  </div>

                  <div class="mt-7 grid gap-5 rounded-md bg-white p-4 md:grid-cols-2">
                    <div>
                      <p class="mb-3 text-sm font-semibold">Shared skills</p>
                      <div class="flex flex-wrap gap-2">
                        <Badge v-for="tag in activeProfile.tags.slice(0, 5)" :key="tag" variant="secondary" class="rounded-md border border-[#e0e7e3] bg-[#f7f9f8] px-3 py-1 text-xs">
                          {{ tag }}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p class="mb-3 text-sm font-semibold">Shared interests</p>
                      <div class="flex flex-wrap gap-2">
                        <Badge v-for="tag in ['AI & Design', 'SaaS', 'No-code', 'Remote Work', 'Design Communities']" :key="tag" variant="secondary" class="rounded-md border border-[#e0e7e3] bg-[#f7f9f8] px-3 py-1 text-xs">
                          {{ tag }}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="activity" class="border-t border-[#e7ece9] py-6">
                  <div class="grid gap-4">
                    <div v-for="item in realtimeActivityItems.slice(0, 6)" :key="`${item.label}-${item.meta}`" class="flex items-start gap-3">
                      <component :is="item.icon" class="mt-0.5 size-4 shrink-0" :class="item.tone" />
                      <div>
                        <p class="text-sm font-semibold">{{ item.label }}</p>
                        <p class="mt-0.5 text-xs text-[#64706c]">{{ item.meta }}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="portfolio" class="border-t border-[#e7ece9] py-6">
                  <div class="grid gap-3">
                    <article v-for="item in portfolioItems" :key="item.title" class="rounded-md bg-[#f7f9f8] p-4">
                      <div class="flex items-start justify-between gap-4">
                        <div>
                          <h3 class="text-sm font-semibold">{{ item.title }}</h3>
                          <p class="mt-1 text-xs text-[#64706c]">{{ item.meta }}</p>
                        </div>
                        <Badge variant="secondary" class="rounded-md bg-white text-xs">{{ item.stat }}</Badge>
                      </div>
                    </article>
                  </div>
                </TabsContent>
              </Tabs>
            </section>
            <section v-else class="grid min-w-0 place-items-center bg-white p-10">
              <div class="max-w-sm text-center">
                <Search class="mx-auto size-6 text-[#7a8581]" />
                <h2 class="mt-4 text-lg font-semibold">No selected profile</h2>
                <p class="mt-2 text-sm leading-6 text-[#64706c]">
                  Adjust the filters on the left to bring matching collaborators back into the discovery feed.
                </p>
                <Button variant="outline" class="mt-5 h-9 rounded-md" @click="clearDiscoverFilters">
                  Reset filters
                </Button>
              </div>
            </section>

            <aside class="hidden border-l border-[#e7ece9] bg-white px-5 py-5 xl:grid xl:content-start xl:gap-5">
              <section class="rounded-md bg-white p-4">
                <h2 class="text-sm font-semibold">Trust & verification</h2>
                <div class="mt-4 grid gap-3">
                  <div v-for="item in trustItems" :key="item" class="flex items-center gap-3 text-xs">
                    <span class="grid size-4 place-items-center rounded-full bg-[#10a66a] text-white">
                      <Check class="size-3" />
                    </span>
                    <span class="flex-1">{{ item }}</span>
                    <Badge v-if="item === 'Community vouch'" variant="secondary" class="rounded-full px-2 py-0 text-[10px]">3</Badge>
                  </div>
                </div>
                <div class="mt-4 flex items-center justify-between border-t border-[#e7ece9] pt-4">
                  <span class="flex items-center gap-2 text-sm font-semibold"><ShieldCheck class="size-4 text-[#10a66a]" />Trust score</span>
                  <span class="text-sm font-semibold text-[#07945c]">High</span>
                </div>
              </section>

              <section class="rounded-md bg-white p-4">
                <div class="flex items-center justify-between">
                  <h2 class="text-sm font-semibold">Realtime activity</h2>
                  <button type="button" class="text-xs font-semibold text-[#07945c]" @click="showActivity">View all</button>
                </div>
                <div class="mt-4 grid gap-4">
                  <div v-for="item in realtimeActivityItems.slice(0, 5)" :key="`${item.label}-${item.meta}`" class="flex gap-3">
                    <component :is="item.icon" class="mt-0.5 size-4 shrink-0" :class="item.tone" />
                    <div class="min-w-0">
                      <p class="truncate text-xs font-medium">{{ item.label }}</p>
                      <p class="text-xs text-[#7a8581]">{{ item.meta }}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section class="rounded-md bg-white p-4">
                <div class="flex items-center justify-between">
                  <h2 class="text-sm font-semibold">Online now (24)</h2>
                  <button type="button" class="text-xs font-semibold text-[#07945c]" @click="showOnlineProfiles">View all</button>
                </div>
                <div class="mt-4 grid grid-cols-5 gap-3">
                  <Avatar v-for="user in onlineUsers" :key="user" class="relative size-8">
                    <AvatarImage :src="user" alt="" />
                    <AvatarFallback>CF</AvatarFallback>
                  </Avatar>
                </div>
              </section>

              <section class="rounded-md bg-white p-4">
                <div class="flex items-center justify-between">
                  <h2 class="text-sm font-semibold">Signals you may like</h2>
                  <button type="button" class="text-xs font-semibold text-[#07945c]" @click="showActivity">View all</button>
                </div>
                <div class="mt-4 grid gap-4">
                  <div v-for="signal in suggestedSignals" :key="signal.label" class="flex items-center gap-3">
                    <span class="grid size-8 place-items-center rounded-full" :class="signal.tone">
                      <Send class="size-4" />
                    </span>
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-xs font-semibold">{{ signal.label }}</p>
                      <p class="truncate text-xs text-[#64706c]">{{ signal.meta }}</p>
                    </div>
                    <Badge variant="secondary" class="rounded-full px-2 py-0 text-[10px]">{{ signal.count }}</Badge>
                  </div>
                </div>
              </section>
            </aside>
          </div>
          <div v-else class="min-h-[calc(100vh-4rem)] bg-white">
            <div class="border-b border-[#e7ece9] px-8 py-7">
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p class="text-xs font-bold uppercase tracking-[0.08em] text-[#7a8581]">Workspace</p>
                  <h1 class="mt-2 text-2xl font-semibold">{{ activeOperation.title }}</h1>
                  <p class="mt-2 max-w-2xl text-sm leading-6 text-[#64706c]">{{ activeOperation.description }}</p>
                </div>
                <Button variant="outline" class="h-9 rounded-md" @click="setActiveNav('Discover')">
                  Back to discover
                </Button>
              </div>
            </div>

            <section v-if="activeNav === 'Matches'" class="grid gap-4 px-8 py-7">
              <article v-for="profile in matchedProfiles" :key="profile.id" class="grid gap-4 border-b border-[#e7ece9] pb-4 md:grid-cols-[1fr_auto] md:items-center">
                <div class="flex min-w-0 gap-3">
                  <Avatar class="size-12 !rounded-md">
                    <AvatarImage :src="profileAvatar(profile.id)" alt="" class="!rounded-md object-cover" />
                    <AvatarFallback>{{ initials(profile.displayName) }}</AvatarFallback>
                  </Avatar>
                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <h2 class="text-sm font-semibold">{{ profile.displayName }}</h2>
                      <Badge v-if="isSignaled(profile.id)" class="rounded-md bg-[#e9f8f1] px-2 py-0 text-[10px] text-[#07945c]">Signaled</Badge>
                      <Badge v-if="isBookmarked(profile.id)" variant="secondary" class="rounded-md px-2 py-0 text-[10px]">Shortlist</Badge>
                    </div>
                    <p class="mt-1 text-xs text-[#64706c]">{{ profileRole(profile.id) }} · {{ profile.city }}</p>
                    <p class="mt-2 max-w-xl text-xs leading-5 text-[#4f5c57]">{{ profile.bio }}</p>
                  </div>
                </div>
                <div class="flex gap-2">
                  <Button variant="outline" class="h-8 rounded-md text-xs" @click="openProfile(profile.id)">Open</Button>
                  <Button class="h-8 rounded-md bg-[#10a66a] text-xs text-white hover:bg-[#0b8e59]" @click="openProfile(profile.id)">Message</Button>
                </div>
              </article>
            </section>

            <section v-else-if="activeNav === 'Signals'" class="grid gap-4 px-8 py-7">
              <article v-for="signal in suggestedSignals" :key="signal.label" class="flex flex-wrap items-center justify-between gap-4 border-b border-[#e7ece9] pb-4">
                <div class="flex items-center gap-3">
                  <span class="grid size-10 place-items-center rounded-full" :class="signal.tone">
                    <Send class="size-4" />
                  </span>
                  <div>
                    <h2 class="text-sm font-semibold">{{ signal.label }}</h2>
                    <p class="mt-1 text-xs text-[#64706c]">{{ signal.meta }}</p>
                  </div>
                </div>
                <Button variant="outline" class="h-8 rounded-md text-xs" @click="showActivity">
                  View signal activity
                </Button>
              </article>
            </section>

            <section v-else-if="activeNav === 'Search intent'" class="grid gap-5 px-8 py-7">
              <div class="max-w-xl">
                <label class="relative block">
                  <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#7a8581]" />
                  <Input
                    v-model="searchQuery"
                    class="h-10 rounded-md border-[#dfe6e2] bg-white pl-10 text-sm"
                    placeholder="Try nestjs, figma, strategy, or singapore"
                    @keyup.enter="searchIntent(searchQuery)"
                  />
                </label>
              </div>
              <div class="flex flex-wrap gap-2">
                <Button v-for="term in ['nestjs', 'figma', 'strategy', 'singapore']" :key="term" variant="outline" class="h-8 rounded-md text-xs" @click="searchIntent(term)">
                  {{ term }}
                </Button>
              </div>
            </section>

            <section v-else-if="activeNav === 'Review queue'" class="grid gap-5 px-8 py-7">
              <div v-if="moderationQueue.length" class="grid gap-4">
                <article v-for="item in moderationQueue" :key="item.id" class="grid gap-3 border-b border-[#e7ece9] pb-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <div class="flex flex-wrap items-center gap-2">
                      <h2 class="text-sm font-semibold">{{ item.summary }}</h2>
                      <Badge class="rounded-md px-2 py-0 text-[10px]" :class="item.severity === 'high' ? 'bg-red-50 text-red-600' : item.severity === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-[#e9f8f1] text-[#07945c]'">
                        {{ item.severity }}
                      </Badge>
                    </div>
                    <p class="mt-1 text-xs text-[#64706c]">{{ item.type }} · {{ item.age }} ago</p>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <Button variant="outline" class="h-8 rounded-md text-xs" :disabled="moderationBusyId === item.id" @click="reviewModeration(item.id, 'dismiss')">Dismiss</Button>
                    <Button variant="outline" class="h-8 rounded-md text-xs" :disabled="moderationBusyId === item.id" @click="reviewModeration(item.id, 'escalate')">Escalate</Button>
                    <Button class="h-8 rounded-md bg-[#10a66a] text-xs text-white hover:bg-[#0b8e59]" :disabled="moderationBusyId === item.id" @click="reviewModeration(item.id, 'approve')">Approve</Button>
                  </div>
                </article>
              </div>
              <div v-else class="rounded-md bg-[#f7f9f8] px-5 py-10 text-center">
                <CheckCircle2 class="mx-auto size-6 fill-[#10a66a] text-white" />
                <h2 class="mt-3 text-sm font-semibold">Queue cleared</h2>
                <p class="mt-1 text-xs text-[#64706c]">All moderation items have been reviewed in this demo session.</p>
              </div>
              <div v-if="moderationHistory.length" class="pt-3">
                <h2 class="text-sm font-semibold">Recent decisions</h2>
                <div class="mt-3 grid gap-2">
                  <p v-for="item in moderationHistory.slice(0, 4)" :key="`${item.id}-${item.reviewedAt}`" class="text-xs text-[#64706c]">
                    {{ item.action }} · {{ item.summary }}
                  </p>
                </div>
              </div>
            </section>

            <section v-else-if="activeNav === 'Reports'" class="grid gap-5 px-8 py-7 md:grid-cols-3">
              <div class="rounded-md bg-[#f7f9f8] p-4">
                <p class="text-xs font-semibold text-[#64706c]">Profiles indexed</p>
                <p class="mt-2 text-2xl font-semibold">{{ rawProfiles.length }}</p>
              </div>
              <div class="rounded-md bg-[#f7f9f8] p-4">
                <p class="text-xs font-semibold text-[#64706c]">Open reviews</p>
                <p class="mt-2 text-2xl font-semibold">{{ moderationQueue.length }}</p>
              </div>
              <div class="rounded-md bg-[#f7f9f8] p-4">
                <p class="text-xs font-semibold text-[#64706c]">Unread events</p>
                <p class="mt-2 text-2xl font-semibold">{{ notificationCount }}</p>
              </div>
            </section>

            <section v-else-if="activeNav === 'Activity feed'" class="grid gap-4 px-8 py-7">
              <article v-for="item in realtimeActivityItems" :key="`${item.id}-${item.label}`" class="flex gap-3 border-b border-[#e7ece9] pb-3">
                <component :is="item.icon" class="mt-0.5 size-4 shrink-0" :class="item.tone" />
                <div>
                  <h2 class="text-sm font-semibold">{{ item.label }}</h2>
                  <p class="mt-1 text-xs text-[#64706c]">{{ item.meta }}</p>
                </div>
              </article>
            </section>

            <section v-else-if="activeNav === 'Online now'" class="grid gap-4 px-8 py-7">
              <article v-for="profile in onlineProfiles" :key="profile.id" class="flex items-center justify-between gap-4 border-b border-[#e7ece9] pb-4">
                <div class="flex items-center gap-3">
                  <Avatar class="size-11 !rounded-md">
                    <AvatarImage :src="profileAvatar(profile.id)" alt="" class="!rounded-md object-cover" />
                    <AvatarFallback>{{ initials(profile.displayName) }}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 class="text-sm font-semibold">{{ profile.displayName }}</h2>
                    <p class="mt-1 text-xs text-[#64706c]">{{ profileRole(profile.id) }} · Online now</p>
                  </div>
                </div>
                <Button variant="outline" class="h-8 rounded-md text-xs" @click="openProfile(profile.id)">Open profile</Button>
              </article>
            </section>

            <section v-else-if="activeNav === 'API status'" class="grid gap-4 px-8 py-7">
              <div v-for="row in apiStatusRows" :key="row.label" class="flex max-w-xl items-center justify-between border-b border-[#e7ece9] pb-3 text-sm">
                <span class="font-medium">{{ row.label }}</span>
                <span class="text-[#07945c]">{{ row.value }}</span>
              </div>
            </section>

            <section v-else-if="activeNav === 'Webhooks'" class="grid gap-5 px-8 py-7">
              <div class="max-w-xl rounded-md bg-[#f7f9f8] p-4">
                <div class="flex items-center justify-between gap-4">
                  <div>
                    <h2 class="text-sm font-semibold">profile.signal_sent</h2>
                    <p class="mt-1 text-xs text-[#64706c]">POST https://api.talentsignal.app/webhooks/signals</p>
                  </div>
                  <Badge class="rounded-md bg-[#e9f8f1] text-[#07945c]">{{ settingsState.webhooksEnabled ? "Enabled" : "Paused" }}</Badge>
                </div>
                <div class="mt-4 flex gap-2">
                  <Button class="h-8 rounded-md bg-[#10a66a] text-xs text-white hover:bg-[#0b8e59]" @click="testWebhook">Send test</Button>
                  <Button variant="outline" class="h-8 rounded-md text-xs" @click="settingsState.webhooksEnabled = !settingsState.webhooksEnabled">
                    {{ settingsState.webhooksEnabled ? "Pause" : "Enable" }}
                  </Button>
                </div>
                <p v-if="webhookStatus === 'delivered'" class="mt-3 text-xs font-semibold text-[#07945c]">Test event delivered.</p>
              </div>
            </section>

            <section v-else-if="activeNav === 'Changelog'" class="grid gap-3 px-8 py-7">
              <p class="text-sm font-semibold">v0.2.0 · API-backed demo workflows</p>
              <p class="text-sm font-semibold">v0.1.5 · Reference-matched discovery dashboard</p>
              <p class="text-sm font-semibold">v0.1.0 · NestJS modules, Swagger, seeded data</p>
            </section>

            <section v-else-if="activeNav === 'Settings'" class="grid max-w-xl gap-4 px-8 py-7">
              <label class="flex items-center justify-between border-b border-[#e7ece9] pb-3 text-sm font-medium">
                Async digest
                <input v-model="settingsState.asyncDigest" type="checkbox" class="size-4 accent-[#10a66a]" />
              </label>
              <label class="flex items-center justify-between border-b border-[#e7ece9] pb-3 text-sm font-medium">
                Profile visible
                <input v-model="settingsState.profileVisible" type="checkbox" class="size-4 accent-[#10a66a]" />
              </label>
              <label class="flex items-center justify-between border-b border-[#e7ece9] pb-3 text-sm font-medium">
                Webhooks enabled
                <input v-model="settingsState.webhooksEnabled" type="checkbox" class="size-4 accent-[#10a66a]" />
              </label>
            </section>

            <section v-else-if="activeNav === 'Docs'" class="grid gap-3 px-8 py-7 text-sm">
              <p><span class="font-semibold">Swagger:</span> http://localhost:4000/docs</p>
              <p><span class="font-semibold">Frontend:</span> Nuxt 4, Pinia, shadcn-vue components</p>
              <p><span class="font-semibold">Backend:</span> NestJS modules, guards, interceptors, DTO validation</p>
            </section>

            <section v-else-if="activeNav === 'Logout'" class="grid place-items-center px-8 py-16 text-center">
              <div>
                <LogOut class="mx-auto size-7 text-[#7a8581]" />
                <h2 class="mt-4 text-lg font-semibold">Demo session kept active</h2>
                <p class="mt-2 max-w-sm text-sm leading-6 text-[#64706c]">The API uses a fixed demo token so reviewers can keep exploring without authentication setup.</p>
              </div>
            </section>
          </div>
        </section>
      </div>
      <div v-if="messageModalOpen && activeProfile" class="fixed inset-0 z-50 grid place-items-center bg-slate-950/20 px-4 backdrop-blur-[2px]">
        <section class="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-base font-semibold">Message {{ activeProfile.displayName }}</h2>
              <p class="mt-1 text-xs text-[#64706c]">Compose a short intro for this collaboration match.</p>
            </div>
            <Button variant="ghost" size="icon" class="size-7" aria-label="Close message composer" @click="messageModalOpen = false">
              <X class="size-4" />
            </Button>
          </div>

          <textarea
            v-model="messageDraft"
            class="mt-4 min-h-32 w-full resize-none rounded-md border border-[#dfe6e2] bg-white p-3 text-sm leading-6 outline-none focus:border-[#10a66a]"
          />

          <div v-if="messageStatus === 'sent'" class="mt-3 rounded-md bg-[#e9f8f1] px-3 py-2 text-xs font-semibold text-[#07945c]">
            Message queued and realtime activity updated.
          </div>
          <div v-if="messageStatus === 'error'" class="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
            Message failed. Check the demo API and try again.
          </div>

          <div class="mt-4 flex justify-end gap-2">
            <Button variant="outline" class="h-9 rounded-md" @click="messageModalOpen = false">Cancel</Button>
            <Button class="h-9 rounded-md bg-[#10a66a] text-white hover:bg-[#0b8e59]" :disabled="!messageDraft.trim() || messageStatus === 'sent' || messageStatus === 'sending'" @click="sendMessage">
              <Send class="size-4" />
              {{ messageStatus === "sending" ? "Sending" : messageStatus === "sent" ? "Sent" : "Send message" }}
            </Button>
          </div>
        </section>
      </div>
    </main>
  </TooltipProvider>
</template>
