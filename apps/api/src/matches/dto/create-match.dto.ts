import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateMatchDto {
  @ApiPropertyOptional({ example: "Strong product overlap, ask about moderation workflow." })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  note?: string;
}
