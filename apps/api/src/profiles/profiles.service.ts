import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../infra/database.service";
import { DiscoverQueryDto } from "./dto/discover-query.dto";
import { seededProfiles } from "./profile.seed";
import { DiscoveryProfile } from "./profile.types";

@Injectable()
export class ProfilesService {
  constructor(private readonly database: DatabaseService) {}

  async discover(query: DiscoverQueryDto): Promise<DiscoveryProfile[]> {
    const profiles = this.database.isConnected
      ? await this.fromDatabase(query)
      : seededProfiles;

    return profiles
      .filter((profile) => !query.intent || profile.intent.includes(query.intent))
      .filter((profile) => !query.city || profile.city.toLowerCase() === query.city.toLowerCase())
      .sort((left, right) => this.sortProfiles(left, right, query.sort));
  }

  async findOne(profileId: string): Promise<DiscoveryProfile | undefined> {
    const profiles = await this.discover({});
    return profiles.find((profile) => profile.id === profileId);
  }

  private async fromDatabase(query: DiscoverQueryDto): Promise<DiscoveryProfile[]> {
    const rows = await this.database.queryProfiles(query);

    return rows.map((row) => ({
      id: row.id,
      handle: row.handle,
      displayName: row.displayName,
      city: row.city,
      intent: row.intent,
      bio: row.bio,
      compatibility: row.compatibility,
      trustScore: row.trustScore,
      tags: row.tags,
      lastActive: "recently",
      avatarTone: "emerald"
    }));
  }

  private sortProfiles(left: DiscoveryProfile, right: DiscoveryProfile, sort = "compatibility") {
    if (sort === "trust") {
      return right.trustScore - left.trustScore;
    }

    if (sort === "recent") {
      return left.lastActive.localeCompare(right.lastActive);
    }

    return right.compatibility - left.compatibility;
  }
}
