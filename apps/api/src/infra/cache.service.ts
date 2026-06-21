import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly redis?: Redis;
  private readonly memory = new Map<string, unknown>();

  constructor(config: ConfigService) {
    const redisUrl = config.get<string>("REDIS_URL");

    if (redisUrl) {
      this.redis = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false
      });
      this.redis.on("error", (error) => this.logger.warn(`Redis unavailable: ${error.message}`));
    }
  }

  async remember<T>(key: string, value: T, ttlSeconds: number): Promise<T> {
    if (!this.redis) {
      this.memory.set(key, value);
      return value;
    }

    try {
      await this.redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch {
      this.memory.set(key, value);
    }

    return value;
  }

  async onModuleDestroy() {
    await this.redis?.quit();
  }
}
