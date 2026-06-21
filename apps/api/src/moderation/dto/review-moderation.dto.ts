import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class ReviewModerationDto {
  @ApiProperty({ enum: ["approve", "escalate", "dismiss"], example: "approve" })
  @IsIn(["approve", "escalate", "dismiss"])
  action: "approve" | "escalate" | "dismiss";

  @ApiProperty({ required: false, example: "Looks safe for demo review." })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  note?: string;
}
