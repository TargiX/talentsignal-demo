import { Controller, Get } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../common/public.decorator";
import { DatabaseService } from "../infra/database.service";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(
    private readonly database: DatabaseService,
    private readonly config: ConfigService
  ) {}

  @Public()
  @Get()
  get() {
    return {
      ok: true,
      app: "talentsignal-api",
      domain: this.config.get("APP_ORIGIN") ?? "https://talentsignal.us",
      mysql: this.database.isConnected ? "connected" : "seeded-fallback",
      redis: this.config.get("REDIS_URL") ? "configured" : "not-configured",
      dynamodb: this.config.get("DYNAMODB_ENDPOINT") ? "configured" : "not-configured",
      opensearch: this.config.get("OPENSEARCH_NODE") ? "configured" : "not-configured"
    };
  }
}
