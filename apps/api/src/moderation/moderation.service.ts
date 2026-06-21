import { Injectable, NotFoundException } from "@nestjs/common";
import { AuditTrailService } from "../infra/audit-trail.service";
import { ReviewModerationDto } from "./dto/review-moderation.dto";

type ModerationItem = {
  id: string;
  type: string;
  severity: string;
  summary: string;
  age: string;
};

@Injectable()
export class ModerationService {
  private readonly items: ModerationItem[] = [
    {
      id: "mod-1",
      type: "profile_copy",
      severity: "medium",
      summary: "New profile mentions off-platform payments.",
      age: "4 min"
    },
    {
      id: "mod-2",
      type: "image_review",
      severity: "low",
      summary: "Avatar confidence below threshold.",
      age: "11 min"
    },
    {
      id: "mod-3",
      type: "trust_signal",
      severity: "high",
      summary: "Repeated signal burst from a new account.",
      age: "19 min"
    }
  ];

  private readonly decisions: Array<ModerationItem & { action: ReviewModerationDto["action"]; reviewedAt: string }> = [];

  constructor(private readonly auditTrail: AuditTrailService) {}

  queue() {
    return this.items;
  }

  history() {
    return this.decisions;
  }

  async review(itemId: string, dto: ReviewModerationDto) {
    const index = this.items.findIndex((item) => item.id === itemId);

    if (index === -1) {
      throw new NotFoundException("Moderation item not found.");
    }

    const [item] = this.items.splice(index, 1);
    const decision = {
      ...item,
      action: dto.action,
      reviewedAt: new Date().toISOString()
    };

    this.decisions.unshift(decision);
    await this.auditTrail.record("moderation.reviewed", {
      itemId,
      action: dto.action,
      note: dto.note ?? null
    });

    return {
      decision,
      queue: this.items,
      history: this.decisions
    };
  }
}
