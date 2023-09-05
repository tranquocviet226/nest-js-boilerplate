import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty } from 'class-validator'

export class VerifyCodeResetRequestDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'abc@gmail.com'
  })
  email: string

  @IsNotEmpty()
  @ApiProperty({
    example: '1996'
  })
  code: string
}
