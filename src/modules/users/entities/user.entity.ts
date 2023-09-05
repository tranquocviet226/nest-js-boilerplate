import { BaseEntity } from 'src/database/entities/base.entity'
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn
} from 'typeorm'
import { UserStatus } from '../../../interfaces/enums/user-status.enum'
import { PermissionEntity } from '../../permissions/permission.entity'
import { RoleEntity } from '../../roles/role.entity'

@Entity({ schema: 'admin', name: 'users' })
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  id: number

  @Column({
    name: 'fullName',
    type: 'varchar',
    length: 100,
    nullable: false
  })
  fullName: string

  @Column({
    name: 'photo_id',
    type: 'int',
    nullable: true
  })
  photoId: number

  @Column({
    name: 'birthday',
    type: 'varchar',
    length: 100,
    nullable: false
  })
  birthday: Date

  @Column({
    name: 'phone',
    type: 'varchar',
    length: 10,
    nullable: true,
    unique: true
  })
  phone: string

  @Column({
    name: 'email',
    type: 'varchar',
    length: 100,
    nullable: true,
    unique: true
  })
  email: string

  @Column({
    name: 'username',
    type: 'varchar',
    unique: true,
    nullable: false
  })
  username: string

  @Column({
    name: 'password',
    type: 'varchar',
    nullable: false
  })
  password: string

  @Column({
    name: 'is_super_user',
    type: 'boolean',
    nullable: false,
    default: false
  })
  isSuperUser: boolean

  @Column({
    name: 'status',
    type: 'varchar',
    nullable: false,
    default: UserStatus.Active
  })
  status: string

  @ManyToMany(() => RoleEntity, (role) => role.id, {
    lazy: true,
    cascade: true
  })
  @JoinTable({
    name: 'users_roles',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id'
    }
  })
  roles: Promise<RoleEntity[]>

  @ManyToMany(() => PermissionEntity, (permission) => permission.id, {
    lazy: true,
    cascade: true
  })
  @JoinTable({
    name: 'users_permissions',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id'
    }
  })
  permissions: Promise<PermissionEntity[]>

  constructor(user?: Partial<UserEntity>) {
    super()
    Object.assign(this, user)
  }
}
