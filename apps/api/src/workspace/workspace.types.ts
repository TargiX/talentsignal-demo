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
