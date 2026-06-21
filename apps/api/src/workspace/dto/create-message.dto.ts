import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateMessageDto {
  @ApiProperty({ example: "Hi Lina, want to compare notes on the collaboration workflow this week?" })
  @IsString()
  @MinLength(2)
  @MaxLength(500)
  body: string;
}
