import { Injectable, NotFoundException } from "@nestjs/common";
import { AuditTrailService } from "../infra/audit-trail.service";
import { CacheService } from "../infra/cache.service";
import { DatabaseService } from "../infra/database.service";
import { ProfilesService } from "../profiles/profiles.service";
import { CreateMatchDto } from "./dto/create-match.dto";

@Injectable()
export class MatchesService {
  constructor(
    private readonly database: DatabaseService,
    private readonly profiles: ProfilesService,
    private readonly cache: CacheService,
    private readonly auditTrail: AuditTrailService
  ) {}

  async likeProfile(userId: string, profileId: string, dto: CreateMatchDto) {
    const profile = await this.profiles.findOne(profileId);

    if (!profile) {
      throw new NotFoundException("Profile not found.");
    }

    const match = this.database.isConnected
      ? await this.database.createMatch(userId, profileId, dto.note)
      : {
          id: `match-${Date.now()}`,
          userId,
          profileId,
          status: "liked",
          note: dto.note,
          createdAt: new Date()
        };

    await this.cache.remember(`match:${userId}:${profileId}`, match, 60);
    await this.auditTrail.record("profile.liked", { userId, profileId, note: dto.note ?? null });

    return {
      match,
      nextStep: `Open a conversation with ${profile.displayName}`
    };
  }
}
