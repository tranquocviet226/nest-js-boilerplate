import { ApiProperty } from '@nestjs/swagger'

export class PhotoResponseDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  name: string

  @ApiProperty()
  originalname: string

  @ApiProperty()
  type: string

  @ApiProperty()
  url: string

  @ApiProperty()
  active: boolean
}
