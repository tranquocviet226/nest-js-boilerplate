import {
  CommonException,
  DisabledUserException,
  InvalidCredentialsException
} from '@common/exceptions'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { HashHelper } from 'src/helpers'
import { ErrorType } from 'src/interfaces/enums'
import { ErrorMessage } from 'src/interfaces/enums/error-message.enum'
import { UserStatus } from 'src/interfaces/enums/user-status.enum'
import { MessageSuccesses } from 'src/interfaces/message.success'
import { MailService } from 'src/modules/mail/mail.service'
import { EmailRequestDto } from 'src/modules/users/dtos/refresh-verify.request.dto'
import { UserEntity } from 'src/modules/users/entities/user.entity'
import { UserMapper } from 'src/modules/users/user.mapper'
import { UsersRepository } from 'src/modules/users/repositories/user.repository'
import {
  AuthCredentialsRequestDto,
  JwtPayload,
  LoginResponseDto
} from '../dtos'
import { TokenService } from './token.service'
import { RefreshVerifyAccountResponseDto } from '../dtos/refresh-verify-account.response.dto'
import { CreateUserRequestDto, UserResponseDto } from 'src/modules/users/dtos'
import { UserValidate } from 'src/modules/users/user.validate'
import { TimeoutError } from 'rxjs'
import { ERoles } from 'src/interfaces/enums/roles.enum'
import { RolesRepository } from 'src/modules/roles/role.repository'
import { MessageResponse } from '@common/interceptors/message.response'
import { ResetPasswordRequestDto } from 'src/modules/users/dtos/reset-password.request.dto'
import { VerifyCodeResetRequestDto } from 'src/modules/users/dtos/verify-code-reset.request.dto'
import { UserCodeEntity } from 'src/modules/users/entities/user-code.entity'
import { UsersCodeRepository } from 'src/modules/users/repositories/user-code.repository'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
    private rolesRepository: RolesRepository,
    private usersCodeRepository: UsersCodeRepository,
    private tokenService: TokenService,
    private mailService: MailService
  ) {}

  /**
   * User authentication
   * @param authCredentialsDto {AuthCredentialsRequestDto}
   * @returns {Promise<LoginResponseDto>}
   */
  public async login({
    username,
    password
  }: AuthCredentialsRequestDto): Promise<LoginResponseDto> {
    const user: UserEntity = await this.usersRepository.findUserByUsername(
      username
    )

    if (!user) {
      throw new CommonException(
        ErrorType.USER_NOT_FOUND,
        ErrorMessage.USER_NOT_FOUND
      )
    }

    const passwordMatch = await HashHelper.compare(password, user.password)

    if (!passwordMatch) {
      throw new InvalidCredentialsException()
    }
    if (user.status === UserStatus.Blocked) {
      throw new DisabledUserException(ErrorType.BLOCKED_USER)
    }
    if (user.status === UserStatus.Inactive) {
      throw new DisabledUserException(ErrorType.INACTIVE_USER)
    }

    const payload: JwtPayload = { id: user.id, username: user.username }
    const token = await this.tokenService.generateAuthToken(payload)

    const userDto = await UserMapper.toDto(user)
    const { permissions, roles } = await UserMapper.toDtoWithRelations(user)
    const additionalPermissions = permissions.map(({ slug }) => slug)
    const mappedRoles = roles.map(({ name, permissions }) => {
      const rolePermissions = permissions.map(({ slug }) => slug)
      return {
        name: name,
        permissions: rolePermissions
      }
    })

    return {
      user: userDto,
      token: token,
      access: {
        additionalPermissions: additionalPermissions,
        roles: mappedRoles
      }
    }
  }

  public async register(
    userDto: CreateUserRequestDto
  ): Promise<UserResponseDto> {
    UserValidate.validateUser(userDto)
    const UserRole = await this.rolesRepository.findOneBy({ name: ERoles.USER })
    if (UserRole) {
      try {
        let userEntity = UserMapper.toCreateEntity(userDto, [UserRole.id])
        userEntity.password = await HashHelper.encrypt(userEntity.password)
        userEntity = await this.usersRepository.save(userEntity)
        const payload: JwtPayload = {
          id: userEntity.id,
          username: userEntity.username
        }
        const token = this.tokenService.generateVerifyToken(payload)

        this.mailService.sendMailConfirmation(userEntity, token.verifyToken)
        return UserMapper.toDto(userEntity)
      } catch (error) {
        if (error instanceof TimeoutError) {
          throw new CommonException(
            ErrorType.REQUEST_TIMEOUT,
            ErrorMessage.REQUEST_TIMEOUT
          )
        } else {
          throw new CommonException(
            ErrorType.INTERNAL_SERVER,
            ErrorMessage.INTERNAL_SERVER
          )
        }
      }
    } else {
      throw new CommonException(
        ErrorType.ROLE_DOES_NOT_EXISTS,
        ErrorMessage.ROLE_DOES_NOT_EXISTS
      )
    }
  }

  public get(user: UserEntity): Promise<UserResponseDto> {
    try {
      return UserMapper.toDto(user)
    } catch (_error) {
      throw new CommonException(
        ErrorType.INTERNAL_SERVER,
        ErrorMessage.INTERNAL_SERVER
      )
    }
  }

  public async refreshVerifyAccount(
    dto: EmailRequestDto
  ): Promise<RefreshVerifyAccountResponseDto> {
    const user = await this.usersRepository.findOneBy({ email: dto.email })
    if (user) {
      if (user.status === UserStatus.Inactive) {
        try {
          const payload: JwtPayload = {
            id: user.id,
            username: user.username
          }
          const token = this.tokenService.generateVerifyToken(payload)
          this.mailService.sendMailConfirmation(user, token.verifyToken)
          return { message: MessageSuccesses.REFRESH_VERIFY_SUCCESS }
        } catch (_error) {
          throw new CommonException(
            ErrorType.INTERNAL_SERVER,
            ErrorMessage.INTERNAL_SERVER
          )
        }
      } else if (user.status === UserStatus.Active) {
        throw new CommonException(
          ErrorType.ACTIVATED_EMAIL,
          ErrorMessage.ACTIVATED_EMAIL
        )
      } else {
        throw new CommonException(
          ErrorType.BLOCKED_EMAIL,
          ErrorMessage.BLOCKED_EMAIL
        )
      }
    } else {
      throw new CommonException(
        ErrorType.EMAIL_NOT_FOUND,
        ErrorMessage.EMAIL_NOT_FOUND
      )
    }
  }

  public async sendCodeResetPassword(
    emailDto: EmailRequestDto
  ): Promise<MessageResponse> {
    const user = await this.usersRepository.findOneBy({ email: emailDto.email })
    if (user) {
      try {
        const emailCode = Math.floor(1000 + Math.random() * 8999)
        const oldDateObj = new Date()
        const expiresDate = new Date(oldDateObj.getTime() + 10 * 60000)

        this.mailService.sendMailResetPassword(user, emailCode)

        const userCode = new UserCodeEntity()
        userCode.email = user.email
        userCode.emailCode = emailCode.toString()
        userCode.expires = expiresDate
        userCode.verified = false

        const update = await this.usersCodeRepository.update(
          { email: userCode.email },
          userCode
        )
        if (update.affected === 0) {
          await this.usersCodeRepository.save(userCode)
        }

        return { message: MessageSuccesses.SEND_MAIL_CODE_SUCCESS }
      } catch (_error) {
        throw new CommonException(
          ErrorType.INTERNAL_SERVER,
          ErrorMessage.INTERNAL_SERVER
        )
      }
    } else {
      throw new CommonException(
        ErrorType.EMAIL_NOT_FOUND,
        ErrorMessage.EMAIL_NOT_FOUND
      )
    }
  }

  public async verifyCodeResetPassword(
    resetPasswordDto: VerifyCodeResetRequestDto
  ): Promise<MessageResponse> {
    const userCode = await this.usersCodeRepository.findOneBy({
      email: resetPasswordDto.email
    })
    if (userCode) {
      const expires = userCode.expires.getTime()
      const dateNow = Date.now()

      if (dateNow < expires) {
        if (userCode.emailCode === resetPasswordDto.code) {
          try {
            userCode.verified = true
            userCode.expires = new Date(Date.now() + 10 * 60000)
            await this.usersCodeRepository.save(userCode)
            return { message: MessageSuccesses.VERIFY_CODE_SUCCESS }
          } catch (_error) {
            throw new CommonException(
              ErrorType.INTERNAL_SERVER,
              ErrorMessage.INTERNAL_SERVER
            )
          }
        } else {
          throw new CommonException(
            ErrorType.INVALID_CODE,
            ErrorMessage.INVALID_CODE
          )
        }
      } else {
        throw new CommonException(
          ErrorType.CODE_EXPIRED,
          ErrorMessage.CODE_EXPIRED
        )
      }
    } else {
      throw new CommonException(
        ErrorType.EMAIL_NOT_FOUND,
        ErrorMessage.EMAIL_NOT_FOUND
      )
    }
  }

  public async resetPassword(
    resetPasswordDto: ResetPasswordRequestDto
  ): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOneBy({
      email: resetPasswordDto.email
    })
    if (user) {
      const userCode = await this.usersCodeRepository.findOneBy({
        email: resetPasswordDto.email
      })
      const expires = userCode.expires.getTime()
      const dateNow = Date.now()
      if (userCode.verified) {
        if (dateNow < expires) {
          try {
            user.password = await HashHelper.encrypt(
              resetPasswordDto.newPassword
            )
            user.status = UserStatus.Active
            const newUser = await this.usersRepository.save(user)
            await this.usersCodeRepository.delete({
              email: resetPasswordDto.email
            })
            return UserMapper.toDto(newUser)
          } catch (_error) {
            throw new CommonException(
              ErrorType.INTERNAL_SERVER,
              ErrorMessage.INTERNAL_SERVER
            )
          }
        } else {
          throw new CommonException(
            ErrorType.CODE_EXPIRED,
            ErrorMessage.CODE_EXPIRED
          )
        }
      } else {
        throw new CommonException(
          ErrorType.VERIFY_CODE_RESET,
          ErrorMessage.VERIFY_CODE_RESET
        )
      }
    } else {
      throw new CommonException(
        ErrorType.EMAIL_NOT_FOUND,
        ErrorMessage.EMAIL_NOT_FOUND
      )
    }
  }
}
