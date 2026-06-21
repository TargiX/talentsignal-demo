import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ReviewModerationDto } from "./dto/review-moderation.dto";
import { ModerationService } from "./moderation.service";

@ApiTags("moderation")
@ApiBearerAuth()
@Controller("moderation")
export class ModerationController {
  constructor(private readonly moderation: ModerationService) {}

  @Get("queue")
  queue() {
    return this.moderation.queue();
  }

  @Get("history")
  history() {
    return this.moderation.history();
  }

  @Post(":itemId/review")
  review(@Param("itemId") itemId: string, @Body() dto: ReviewModerationDto) {
    return this.moderation.review(itemId, dto);
  }
}
