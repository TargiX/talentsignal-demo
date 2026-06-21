import { Injectable, NotFoundException } from "@nestjs/common";
import { AuditTrailService } from "../infra/audit-trail.service";
import { ProfilesService } from "../profiles/profiles.service";
import { CreateMessageDto } from "./dto/create-message.dto";
import { DemoActivityItem, DemoMessage, DemoWorkspaceState } from "./workspace.types";

@Injectable()
export class WorkspaceService {
  private readonly states = new Map<string, DemoWorkspaceState>();

  constructor(
    private readonly profiles: ProfilesService,
    private readonly auditTrail: AuditTrailService
  ) {}

  getState(userId: string) {
    return this.ensureState(userId);
  }

  getActivity(userId: string) {
    return this.ensureState(userId).activities;
  }

  async sendMessage(userId: string, profileId: string, dto: CreateMessageDto) {
    const profile = await this.profiles.findOne(profileId);

    if (!profile) {
      throw new NotFoundException("Profile not found.");
    }

    const state = this.ensureState(userId);
    const message: DemoMessage = {
      id: `msg-${Date.now()}`,
      profileId,
      profileName: profile.displayName,
      body: dto.body.trim(),
      status: "queued",
      createdAt: new Date().toISOString()
    };

    state.messages.unshift(message);
    const activity = this.pushActivity(state, {
      type: "message",
      label: `You messaged ${profile.displayName}`,
      profileId
    });

    await this.auditTrail.record("profile.message_queued", { userId, profileId, messageId: message.id });

    return { message, activity, state };
  }

  async sendSignal(userId: string, profileId: string) {
    const profile = await this.profiles.findOne(profileId);

    if (!profile) {
      throw new NotFoundException("Profile not found.");
    }

    const state = this.ensureState(userId);
    const alreadySent = state.signaledProfileIds.includes(profileId);

    if (!alreadySent) {
      state.signaledProfileIds.unshift(profileId);
      this.pushActivity(state, {
        type: "signal",
        label: `Signal sent to ${profile.displayName}`,
        profileId
      });
      await this.auditTrail.record("profile.signal_sent", { userId, profileId });
    }

    return {
      profileId,
      status: alreadySent ? "already_sent" : "sent",
      state
    };
  }

  async toggleBookmark(userId: string, profileId: string) {
    const profile = await this.profiles.findOne(profileId);

    if (!profile) {
      throw new NotFoundException("Profile not found.");
    }

    const state = this.ensureState(userId);
    const isBookmarked = state.bookmarkedProfileIds.includes(profileId);

    if (isBookmarked) {
      state.bookmarkedProfileIds = state.bookmarkedProfileIds.filter((id) => id !== profileId);
      this.pushActivity(state, {
        type: "bookmark",
        label: `${profile.displayName} removed from shortlist`,
        profileId
      });
    } else {
      state.bookmarkedProfileIds.unshift(profileId);
      this.pushActivity(state, {
        type: "bookmark",
        label: `${profile.displayName} saved to shortlist`,
        profileId
      });
    }

    await this.auditTrail.record("profile.bookmark_toggled", {
      userId,
      profileId,
      bookmarked: !isBookmarked
    });

    return {
      profileId,
      bookmarked: !isBookmarked,
      state
    };
  }

  private ensureState(userId: string) {
    const existing = this.states.get(userId);

    if (existing) {
      return existing;
    }

    const state: DemoWorkspaceState = {
      signaledProfileIds: [],
      bookmarkedProfileIds: [],
      messages: [],
      unreadCount: 3,
      activities: [
        { id: "act-1", type: "like", label: "Lina liked your signal", meta: "2m ago", profileId: "pf-lina" },
        { id: "act-2", type: "view", label: "Lina viewed your profile", meta: "5m ago", profileId: "pf-lina" },
        { id: "act-3", type: "message", label: "Mateo sent a message", meta: "15m ago", profileId: "pf-mateo" },
        { id: "act-4", type: "profile", label: "Aisha updated her profile", meta: "22m ago", profileId: "pf-aisha" },
        { id: "act-5", type: "online", label: "Ethan is online", meta: "45m ago", profileId: "pf-ethan" }
      ]
    };

    this.states.set(userId, state);
    return state;
  }

  private pushActivity(
    state: DemoWorkspaceState,
    activity: Omit<DemoActivityItem, "id" | "meta">
  ) {
    const item: DemoActivityItem = {
      ...activity,
      id: `act-${Date.now()}`,
      meta: "Just now"
    };

    state.activities.unshift(item);
    state.activities = state.activities.slice(0, 20);
    state.unreadCount += 1;

    return item;
  }
}
