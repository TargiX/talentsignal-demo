import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class DiscoverQueryDto {
  @ApiPropertyOptional({ example: "dating" })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  intent?: string;

  @ApiPropertyOptional({ example: "Berlin" })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;

  @ApiPropertyOptional({ enum: ["compatibility", "recent", "trust"] })
  @IsOptional()
  @IsIn(["compatibility", "recent", "trust"])
  sort?: "compatibility" | "recent" | "trust";
}
