import {
  CurrentUser,
  JwtAuthGuard,
  Permissions,
  PermissionsGuard,
  TOKEN_NAME
} from '@auth'
import { ApiGlobalResponse, PaginationParams } from '@common/decorators'
import { PaginationResponseDto } from '@common/dtos'
import { PaginationRequest } from '@common/interfaces'
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  ValidationPipe
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags
} from '@nestjs/swagger'
import { QueryRequest } from 'src/helpers/query.request'
import { EPermissions } from 'src/interfaces/enums/permissions.enum'
import { UserResponseDto } from './dtos'
import { CreateUserRequestDto } from './dtos/create-user-request.dto'
import { UpdateUserIdRequestDto } from './dtos/update-user-id.request.dto'
import { UpdateUserRequestDto } from './dtos/update-user.request.dto'
import { UserEntity } from './entities/user.entity'
import { UserService } from './user.service'

@ApiTags('User Controller')
@ApiBearerAuth(TOKEN_NAME)
@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @ApiOperation({ description: 'Get list user' })
  @ApiGlobalResponse(UserResponseDto)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(EPermissions.ADMIN_ACCESS_USERS_LIST)
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'orderBy', required: false, description: 'users.id' })
  @ApiQuery({
    name: 'orderDirection',
    required: false,
    description: 'ASC || DESC'
  })
  @ApiQuery({ name: 'search', required: false })
  @Get()
  public listUser(
    @PaginationParams() pagination: PaginationRequest<QueryRequest>
  ): Promise<PaginationResponseDto<UserEntity>> {
    return this.usersService.listUser(pagination)
  }

  @UseGuards(JwtAuthGuard)
  @Permissions(EPermissions.ADMIN_ACCESS_USERS_CREATE)
  @ApiOperation({ description: 'Create new user' })
  @ApiGlobalResponse(UserResponseDto)
  @ApiConflictResponse({ description: 'User already exists' })
  @Post()
  public createUser(
    @Body(ValidationPipe) userDto: CreateUserRequestDto
  ): Promise<UserResponseDto> {
    return this.usersService.createUser(userDto)
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: 'Get user infomation' })
  @ApiGlobalResponse(UserResponseDto)
  @Get()
  public getUsers(@CurrentUser() user: UserEntity): Promise<UserResponseDto> {
    return this.usersService.getUsers(user)
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: 'Get user infomation by id' })
  @ApiGlobalResponse(UserResponseDto)
  @ApiParam({ name: 'id', example: 1, required: true })
  @Get(':id')
  public getUserById(@Param() id: number): Promise<UserResponseDto> {
    return this.usersService.getUserById(id)
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: 'Update user' })
  @ApiGlobalResponse(UserResponseDto)
  @Patch()
  public updateUser(
    @CurrentUser() currentUser: UserEntity,
    @Body(ValidationPipe) newUser: UpdateUserRequestDto
  ): Promise<UserResponseDto> {
    return this.usersService.updateUser(currentUser, newUser)
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(EPermissions.ADMIN_ACCESS_USERS_UPDATE_ID)
  @ApiParam({ name: 'id', example: 1, required: true })
  @ApiOperation({ description: 'Update user by id' })
  @Patch(':id')
  public updateUserById(
    @Param() id: number,
    @Body(ValidationPipe) newUser: UpdateUserIdRequestDto
  ): Promise<UserResponseDto> {
    return this.usersService.updateUserById(id, newUser)
  }
}
