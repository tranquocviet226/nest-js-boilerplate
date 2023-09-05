import {
  AccessTokenExpiredException,
  InvalidTokenException,
  RefreshTokenExpiredException
} from '@common/exceptions'
import { SourceTokenExpiredException } from '@common/exceptions/source-token-expired.exception'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { UserStatus } from 'src/interfaces/enums/user-status.enum'
import { UserEntity } from 'src/modules/users/entities/user.entity'
import { UsersRepository } from 'src/modules/users/repositories/user.repository'
import { JwtPayload, TokenDto, ValidateTokenResponseDto } from '../dtos'
import { VerifyTokenDto } from '../dtos/token.dto'
import { VerifyAccountRequestDto } from '../dtos/verify-account.request.dto'
import { VerifyAccountResponseDto } from '../dtos/verify-account.response.dto'
import { TokenError, TokenType } from '../enums'

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  /**
   * Generate Auth token(JWT) service for login user
   * @param JwtPayload {JwtPayload}
   * @returns TokenDto Returns access and refresh tokens with expiry
   */
  public generateAuthToken(payload: JwtPayload): TokenDto {
    const accessTokenExpires = this.configService.get('ACCESS_TOKEN_EXPIRES_IN')
    const refreshTokenExpires = this.configService.get(
      'REFRESH_TOKEN_EXPIRES_IN'
    )
    const tokenType = this.configService.get('TOKEN_TYPE')
    const accessToken = this.generateToken(payload, accessTokenExpires)
    const refreshToken = this.generateToken(payload, refreshTokenExpires)

    return {
      tokenType: tokenType,
      accessToken: accessToken,
      accessTokenExpires: accessTokenExpires,
      refreshToken: refreshToken
    }
  }

  public generateVerifyToken(payload: JwtPayload): VerifyTokenDto {
    const verifyTokenExpires = this.configService.get('VERIFY_TOKEN_EXPIRES_IN')
    const verifyToken = this.generateToken(payload, verifyTokenExpires)

    return {
      verifyToken: verifyToken,
      verifyTokenExpires: verifyTokenExpires
    }
  }

  /**
   * Generate Refresh token(JWT) service for generating new refresh and access tokens
   * @param payload {JwtPayload}
   * @returns  Returns access and refresh tokens with expiry or error
   */
  public generateRefreshToken(refreshToken: string): TokenDto {
    const { id, username } = this.verifyToken(
      refreshToken,
      TokenType.RefreshToken
    )
    return this.generateAuthToken({ id: id, username: username })
  }

  /**
   * Verify JWT service
   * @param token JWT token
   * @param type {TokenType} "refresh" or "access"
   * @returns decrypted payload from JWT
   */
  public verifyToken(token: string, type: TokenType) {
    try {
      return this.jwtService.verify(token)
    } catch ({ name }) {
      if (
        name === TokenError.TokenExpiredError &&
        type === TokenType.AccessToken
      ) {
        throw new AccessTokenExpiredException()
      }
      if (
        name === TokenError.TokenExpiredError &&
        type === TokenType.RefreshToken
      ) {
        throw new RefreshTokenExpiredException()
      }
      if (type === TokenType.SourceToken) {
        throw new SourceTokenExpiredException()
      }
      throw new InvalidTokenException()
    }
  }

  /**
   * Validate received JWT
   * @param token {string}
   * @returns valid: boolean
   */
  public async validateToken(token: string): Promise<ValidateTokenResponseDto> {
    try {
      const { id } = this.jwtService.verify(token)
      const user = await this.usersRepository.findOne(id)
      if (
        !user ||
        user.status === UserStatus.Blocked ||
        user.status === UserStatus.Inactive
      ) {
        return { valid: false }
      }
      return { valid: !!id }
    } catch (_error) {
      return { valid: false }
    }
  }

  public async verifyAccount(
    query: VerifyAccountRequestDto,
    res
  ): Promise<VerifyAccountResponseDto> {
    let user: UserEntity = null
    try {
      const token = query?.token
      const { id } = this.jwtService.verify(token)
      user = await this.usersRepository.findOne(id)
    } catch (_error) {
      return res.render('verify-email-failed')
    }
    if (!user) {
      return res.render('verify-email-failed')
    } else if (user.status === UserStatus.Active) {
      return res.render('verify-email-failed')
    }
    user.status = UserStatus.Active
    await this.usersRepository.save(user)
    return res.render('verify-email-success')
  }

  /**
   * Generate JWT token
   * @private
   * @param payload {JwtPayload}
   * @param expiresIn {string}
   * @returns JWT
   */
  private generateToken(payload: JwtPayload, expiresIn: string): string {
    const token = this.jwtService.sign(payload, { expiresIn: expiresIn })
    return token
  }

  public generateSourceToken(name: string, expiresIn: string): string {
    const token = this.jwtService.sign({ name }, { expiresIn: expiresIn })
    return token
  }
}
