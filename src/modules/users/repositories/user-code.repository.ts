import { Repository } from 'typeorm'
import { UserCodeEntity } from '../entities/user-code.entity'

export class UsersCodeRepository extends Repository<UserCodeEntity> {}
