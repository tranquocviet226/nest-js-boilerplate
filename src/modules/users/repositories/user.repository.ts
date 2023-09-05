import { PaginationRequest } from '@common/interfaces'
import { QueryRequest } from 'src/helpers/query.request'
import { Repository } from 'typeorm'
import { UserEntity } from '../entities/user.entity'

export class UsersRepository extends Repository<UserEntity> {
  /**
   * Get users list
   * @param pagination {PaginationRequest}
   * @returns [userEntities: UserEntity[], totalUsers: number]
   */
  public getUsersAndCount(
    pagination: PaginationRequest<QueryRequest>
  ): Promise<[userEntities: UserEntity[], totalUsers: number]> {
    const {
      skip,
      perPage: take,
      query: { search }
    } = pagination
    const query = this.createQueryBuilder('users')
      .innerJoinAndSelect('users.roles', 'roles')
      .leftJoinAndSelect('users.permissions', 'permissions')
      .skip(skip)
      .take(take)

    if (search) {
      query.where(
        `
        users.username LIKE :search
            OR users.fullName LIKE :search
            OR users.email LIKE :search
            OR users.phone LIKE :search
            `,
        { search: `%${search}%` }
      )
    }

    return query.getManyAndCount()
  }

  /**
   * find user by username
   * @param username {string}
   * @returns Promise<string>
   */
  async findUserByUsername(username: string): Promise<UserEntity> {
    return await this.createQueryBuilder('u')
      .leftJoinAndSelect('u.roles', 'r', 'r.active = true')
      .leftJoinAndSelect('r.permissions', 'rp', 'rp.active = true')
      .leftJoinAndSelect('u.permissions', 'p', 'p.active = true')
      .where('u.username = :username', { username: username })
      .getOne()
  }

  async getOneOrFail(value: string): Promise<UserEntity> {
    return await this.createQueryBuilder('users')
      .where('users.id = :id OR users.email = :email', {
        id: value,
        email: value
      })
      .getOneOrFail()
    // some code which fetch user entity or throw exception
  }
}
