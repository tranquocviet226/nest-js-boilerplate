import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { MailModule } from '../mail/mail.module'
import { RolesRepository } from '../roles/role.repository'
import { UserController } from './user.controller'
import { UsersRepository } from './repositories/user.repository'
import { UserService } from './user.service'
import { UsersCodeRepository } from './repositories/user-code.repository'
import { UserValidate } from './user.validate'

@Module({
  imports: [
    MailModule,
    AuthModule,
    TypeOrmModule.forFeature([
      UsersRepository,
      UsersCodeRepository,
      RolesRepository
    ])
  ],
  providers: [UserService, UserValidate],
  controllers: [UserController]
})
export class UserModule {}
