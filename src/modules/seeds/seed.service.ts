import { Injectable } from '@nestjs/common'
import * as _ from 'lodash'
import { HashHelper } from 'src/helpers'
import { EPermissions } from 'src/interfaces/enums/permissions.enum'
import { Connection, In } from 'typeorm'
import { PermissionEntity } from '../permissions/permission.entity'
import { RoleEntity } from '../roles/role.entity'
import { UserStatus } from '../../interfaces/enums/user-status.enum'
import { UserEntity } from '../users/entities/user.entity'
import { CommonException } from '@common/exceptions'
import { ErrorType } from 'src/interfaces/enums'
import { ErrorMessage } from 'src/interfaces/enums/error-message.enum'
import { MessageResponse } from '@common/interceptors/message.response'
import { MessageSuccesses } from 'src/interfaces/message.success'

const users = [
  {
    username: 'admin',
    password: 'Khoqua226',
    fullName: 'Admin',
    birthday: new Date(),
    email: 'tranquocviet226@gmail.com',
    phone: '0346718110',
    isSuperUser: true,
    status: UserStatus.Active
  }
]
const rolePermissions = {
  Developer: [
    {
      slug: EPermissions.ADMIN_ROOT,
      description: 'Full access'
    },
    {
      slug: EPermissions.ADMIN_ACCESS_USERS_LIST,
      description: 'Get list users'
    },
    { slug: EPermissions.ADMIN_ACCESS_USERS_READ, description: 'Read users' },
    {
      slug: EPermissions.ADMIN_ACCESS_USERS_CREATE,
      description: 'Create users'
    },
    {
      slug: EPermissions.ADMIN_ACCESS_USERS_UPDATE,
      description: 'Update users'
    },
    {
      slug: EPermissions.ADMIN_ACCESS_USERS_UPDATE_ID,
      description: 'Update users by id'
    },

    {
      slug: EPermissions.ADMIN_ACCESS_ROLES_LIST,
      description: 'Get list Roles'
    },
    { slug: EPermissions.ADMIN_ACCESS_ROLES_READ, description: 'Read Roles' },
    {
      slug: EPermissions.ADMIN_ACCESS_ROLES_CREATE,
      description: 'Create Roles'
    },
    {
      slug: EPermissions.ADMIN_ACCESS_ROLES_UPDATE,
      description: 'Update Roles'
    },

    {
      slug: EPermissions.ADMIN_ACCESS_PERMISSIONS_LIST,
      description: 'Get list permissions'
    },
    {
      slug: EPermissions.ADMIN_ACCESS_PERMISSIONS_CREATE,
      description: 'Read permissions'
    },
    {
      slug: EPermissions.ADMIN_ACCESS_PERMISSIONS_READ,
      description: 'Create permissions'
    },
    {
      slug: EPermissions.ADMIN_ACCESS_PERMISSIONS_UPDATE,
      description: 'Update permissions'
    }
  ],
  Admin: [
    {
      slug: EPermissions.ADMIN_ROOT,
      description: 'Full access'
    },
    { slug: EPermissions.ADMIN_ACCESS_USERS_READ, description: 'Read users' },
    {
      slug: EPermissions.ADMIN_ACCESS_USERS_CREATE,
      description: 'Create users'
    },
    {
      slug: EPermissions.ADMIN_ACCESS_USERS_UPDATE,
      description: 'Update users'
    },
    {
      slug: EPermissions.ADMIN_ACCESS_USERS_UPDATE_ID,
      description: 'Update users by id'
    },

    { slug: EPermissions.ADMIN_ACCESS_ROLES_READ, description: 'Read Roles' },
    {
      slug: EPermissions.ADMIN_ACCESS_ROLES_CREATE,
      description: 'Create Roles'
    },
    {
      slug: EPermissions.ADMIN_ACCESS_ROLES_UPDATE,
      description: 'Update Roles'
    },

    {
      slug: EPermissions.ADMIN_ACCESS_PERMISSIONS_CREATE,
      description: 'Read permissions'
    },
    {
      slug: EPermissions.ADMIN_ACCESS_PERMISSIONS_READ,
      description: 'Create permissions'
    },
    {
      slug: EPermissions.ADMIN_ACCESS_PERMISSIONS_UPDATE,
      description: 'Update permissions'
    }
  ],
  User: [
    { slug: EPermissions.ADMIN_ACCESS_USERS_READ, description: 'Read users' },
    {
      slug: EPermissions.ADMIN_ACCESS_USERS_CREATE,
      description: 'Create users'
    },
    {
      slug: EPermissions.ADMIN_ACCESS_USERS_UPDATE,
      description: 'Update users'
    }
  ]
}

@Injectable()
export class SeedService {
  constructor(private readonly connection: Connection) {}

  public async createSeed(): Promise<MessageResponse> {
    try {
      const roleNames = Object.keys(rolePermissions)
      // Distinct permissions contained in all roles
      const permissions = _.uniqBy(
        roleNames.reduce((acc, roleName) => {
          return acc.concat(rolePermissions[roleName])
        }, []),
        'slug'
      )
      // Getting slugs form permissions
      const permissionSlugs = permissions.map((p) => p.slug)
      // Getting existing permissions from the DB
      const existingPermissions = await this.connection.manager.find(
        PermissionEntity,
        { where: { slug: In(permissionSlugs) } }
      )
      // Mapping all permissions to permission entities
      const validPermissions = permissions.map((p) => {
        const existing = existingPermissions.find((e) => e.slug === p.slug)
        if (existing) {
          return existing
        }
        return new PermissionEntity(p)
      })
      // Creating / updating permissions
      const savedPermissions = (
        await this.connection.manager.save(validPermissions)
      ).reduce((acc, p) => {
        return { ...acc, [p.slug]: p }
      }, {})

      // Creating roles
      const roles = roleNames.map((name) => {
        const permissions = Promise.resolve(
          rolePermissions[name].map((p) => savedPermissions[p.slug])
        )
        return new RoleEntity({ name: name, permissions: permissions })
      })
      const savedRoles = await this.connection.manager.save(roles)
      // Creating users
      const entities = await Promise.all(
        users.map(async (u) => {
          const roles = Promise.resolve(savedRoles)
          const password = await HashHelper.encrypt(u.password)
          const user = new UserEntity({
            ...u,
            password: password,
            roles: roles
          })
          return user
        })
      )
      await this.connection.manager.save(entities)
      return { message: MessageSuccesses.SUCCESS }
    } catch (_error) {
      throw new CommonException(
        ErrorType.INTERNAL_SERVER,
        ErrorMessage.INTERNAL_SERVER
      )
    }
  }
}
