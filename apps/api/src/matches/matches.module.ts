import { Module } from "@nestjs/common";
import { InfraModule } from "../infra/infra.module";
import { ProfilesModule } from "../profiles/profiles.module";
import { MatchesController } from "./matches.controller";
import { MatchesService } from "./matches.service";

@Module({
  imports: [ProfilesModule, InfraModule],
  controllers: [MatchesController],
  providers: [MatchesService]
})
export class MatchesModule {}
