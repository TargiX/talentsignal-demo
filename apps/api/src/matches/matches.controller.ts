import { Body, Controller, Param, Post, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CreateMatchDto } from "./dto/create-match.dto";
import { MatchesService } from "./matches.service";

@ApiTags("matches")
@ApiBearerAuth()
@Controller("matches")
export class MatchesController {
  constructor(private readonly matches: MatchesService) {}

  @Post(":profileId/like")
  like(@Param("profileId") profileId: string, @Body() dto: CreateMatchDto, @Req() request: any) {
    return this.matches.likeProfile(request.user.id, profileId, dto);
  }
}
