import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty } from 'class-validator'

export class EmailRequestDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'abc@gmail.com'
  })
  email: string
}
