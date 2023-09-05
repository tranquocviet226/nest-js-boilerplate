import { ApiProperty } from '@nestjs/swagger'
import { PermissionResponseDto } from '../../permissions/dtos'
import { RoleResponseDto } from '../../roles/dtos'

export class UserResponseDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  fullName: string

  @ApiProperty()
  photoId: number

  @ApiProperty()
  birthday: Date

  @ApiProperty()
  phone: string

  @ApiProperty()
  email: string

  @ApiProperty()
  username: string

  @ApiProperty({ type: [RoleResponseDto] })
  roles?: RoleResponseDto[]

  @ApiProperty({ type: [PermissionResponseDto] })
  permissions?: PermissionResponseDto[]

  @ApiProperty()
  isSuperUser: boolean

  @ApiProperty()
  status: string
}
