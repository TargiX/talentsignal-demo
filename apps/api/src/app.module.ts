import { Module } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { DemoAuthGuard } from "./auth/demo-auth.guard";
import { HealthModule } from "./health/health.module";
import { InfraModule } from "./infra/infra.module";
import { RequestContextInterceptor } from "./common/request-context.interceptor";
import { MatchesModule } from "./matches/matches.module";
import { ModerationModule } from "./moderation/moderation.module";
import { ProfilesModule } from "./profiles/profiles.module";
import { SearchModule } from "./search/search.module";
import { WorkspaceModule } from "./workspace/workspace.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    InfraModule,
    AuthModule,
    HealthModule,
    ProfilesModule,
    MatchesModule,
    SearchModule,
    ModerationModule,
    WorkspaceModule
  ],
  providers: [
    { provide: APP_GUARD, useClass: DemoAuthGuard },
    { provide: APP_INTERCEPTOR, useClass: RequestContextInterceptor }
  ]
})
export class AppModule {}
