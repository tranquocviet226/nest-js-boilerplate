/**
 * Interface intended for requesting results paginated
 */

export interface ISort {
  [field: string]: 'ASC' | 'DESC'
}

export interface PaginationRequest<T> {
  skip: number
  page?: number
  perPage?: number
  sort?: string[] | string
  filter?: string
  range?: string
  // Other params of type T
  query?: T
}
