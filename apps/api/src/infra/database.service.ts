import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import mysql, { Pool } from "mysql2/promise";
import { DiscoverQueryDto } from "../profiles/dto/discover-query.dto";
import { DiscoveryProfile } from "../profiles/profile.types";

type ProfileRow = Omit<DiscoveryProfile, "lastActive" | "avatarTone">;

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool?: Pool;
  private connected = false;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const url = this.config.get<string>("DATABASE_URL");

    if (!url) {
      return;
    }

    try {
      this.pool = mysql.createPool({
        uri: url,
        connectionLimit: 6,
        namedPlaceholders: true
      });
      await this.pool.query("select 1");
      this.connected = true;
    } catch (error) {
      this.logger.warn(`MySQL unavailable, using seeded in-memory data: ${(error as Error).message}`);
      await this.pool?.end();
      this.pool = undefined;
    }
  }

  get isConnected() {
    return this.connected;
  }

  async queryProfiles(query: DiscoverQueryDto): Promise<ProfileRow[]> {
    if (!this.pool) {
      return [];
    }

    const conditions: string[] = [];
    const params: Record<string, string> = {};

    if (query.intent) {
      conditions.push("intent like :intent");
      params.intent = `%${query.intent}%`;
    }

    if (query.city) {
      conditions.push("city = :city");
      params.city = query.city;
    }

    const where = conditions.length ? `where ${conditions.join(" and ")}` : "";
    const [rows] = await this.pool.query(
      `select id, handle, display_name as displayName, city, intent, bio,
        compatibility, trust_score as trustScore, tags
       from profiles ${where}
       order by compatibility desc
       limit 20`,
      params
    );

    return (rows as Array<ProfileRow & { tags: string }>).map((row) => ({
      ...row,
      tags: JSON.parse(row.tags) as string[]
    }));
  }

  async createMatch(userId: string, profileId: string, note?: string) {
    if (!this.pool) {
      throw new Error("MySQL pool is not connected.");
    }

    const id = `match-${Date.now()}`;
    await this.pool.query(
      `insert into matches (id, user_id, profile_id, status, note)
       values (:id, :userId, :profileId, 'liked', :note)`,
      { id, userId, profileId, note: note ?? null }
    );

    return {
      id,
      userId,
      profileId,
      status: "liked",
      note,
      createdAt: new Date()
    };
  }

  async onModuleDestroy() {
    await this.pool?.end();
  }
}
