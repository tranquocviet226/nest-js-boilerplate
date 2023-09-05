import { PaginationRequest } from '@common/interfaces'
import { SearchRequest } from 'src/interfaces/search.interface'
import { EntityRepository, Repository } from 'typeorm'
import { PermissionEntity } from './permission.entity'

@EntityRepository(PermissionEntity)
export class PermissionsRepository extends Repository<PermissionEntity> {
  /**
   * Get permision list
   * @param pagination {PaginationRequest}
   * @returns permissionEntities[] and totalPermissions
   */
  public getPermissionsAndCount(
    pagination: PaginationRequest<SearchRequest>
  ): Promise<
    [permissionEntities: PermissionEntity[], totalPermissions: number]
  > {
    const {
      skip,
      perPage: take,
      query: { search }
    } = pagination
    const query = this.createQueryBuilder().skip(skip).take(take)

    if (search) {
      query.where('description ILIKE :search', {
        search: `%${search}%`
      })
    }

    return query.getManyAndCount()
  }
}
