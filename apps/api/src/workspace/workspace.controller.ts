import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CreateMessageDto } from "./dto/create-message.dto";
import { WorkspaceService } from "./workspace.service";

@ApiTags("workspace")
@ApiBearerAuth()
@Controller("workspace")
export class WorkspaceController {
  constructor(private readonly workspace: WorkspaceService) {}

  @Get()
  state(@Req() request: any) {
    return this.workspace.getState(request.user.id);
  }

  @Get("activity")
  activity(@Req() request: any) {
    return this.workspace.getActivity(request.user.id);
  }

  @Post("messages/:profileId")
  message(@Param("profileId") profileId: string, @Body() dto: CreateMessageDto, @Req() request: any) {
    return this.workspace.sendMessage(request.user.id, profileId, dto);
  }

  @Post("signals/:profileId")
  signal(@Param("profileId") profileId: string, @Req() request: any) {
    return this.workspace.sendSignal(request.user.id, profileId);
  }

  @Post("bookmarks/:profileId/toggle")
  bookmark(@Param("profileId") profileId: string, @Req() request: any) {
    return this.workspace.toggleBookmark(request.user.id, profileId);
  }
}
