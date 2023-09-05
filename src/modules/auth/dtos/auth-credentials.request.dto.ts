import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class AuthCredentialsRequestDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 'admin'
  })
  readonly username: string

  @IsNotEmpty()
  @ApiProperty({
    example: 'Khoqua226'
  })
  readonly password: string
}
