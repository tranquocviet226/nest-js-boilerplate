import { isEmpty } from 'lodash'
import { SelectQueryBuilder } from 'typeorm'

const toSlug = (str: string) => {
  str = str.toLowerCase()

  // xóa dấu
  str = str
    .normalize('NFD') // chuyển chuỗi sang unicode tổ hợp
    .replace(/[\u0300-\u036f]/g, '') // xóa các ký tự dấu sau khi tách tổ hợp

  // Thay ký tự đĐ
  str = str.replace(/[đĐ]/g, 'd')

  // Xóa ký tự đặc biệt
  str = str.replace(/([^0-9a-z-\s])/g, '')

  // Xóa khoảng trắng thay bằng ký tự -
  str = str.replace(/(\s+)|\-/g, '-')

  // Xóa ký tự - liên tiếp
  str = str.replace(/-+/g, '-')

  // xóa phần dư - ở đầu & cuối
  str = str.replace(/^-+|-+$/g, '')

  // return
  return str
}

const vndFormatter = (num = 0) => {
  if (num < 0) return '0 ₫'
  return num.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
}

const removeEmpty = (obj: any) => {
  for (const key in obj) {
    if (obj[key] == null) {
      delete obj[key]
    }
  }
}

function applySearch(
  query: SelectQueryBuilder<unknown>,
  q: string,
  tableName: string
) {
  if (q) {
    query.where(
      `${tableName}.name LIKE :q
      OR ${tableName}.description LIKE :q`,
      { q: `%${q}%` }
    )
  }
}

function applyFilter(
  query: SelectQueryBuilder<unknown>,
  filter: string,
  tableName: string
) {
  if (!isEmpty(filter)) {
    const filterObject = JSON.parse(filter)
    Object.entries(filterObject).forEach(
      ([property, value]: [string, string]) => {
        switch (property) {
          case 'q':
            applySearch(query, value, tableName)
            break
          case 'category_id':
            let ids = []
            if (Array.isArray(value)) ids = value
            else ids = [value]
            query.andWhere(`categories.id IN (:...ids)`, { ids })
            break
          default:
            if (Array.isArray(value)) {
              query.andWhere(`${tableName}.${property} IN (:...${property})`, {
                [property]: value
              })
            } else {
              query.andWhere(`${tableName}.${property} = :${property}`, {
                [property]: value
              })
            }
            break
        }
      }
    )
  }
}

function applySort(
  query: SelectQueryBuilder<unknown>,
  sort: string | string[],
  tableName: string
) {
  if (!isEmpty(sort)) {
    if (typeof sort === 'string') {
      const [field, direction] = JSON.parse(sort)
      query.addOrderBy(`${tableName}.${field}`, direction)
    } else {
      sort.forEach((sortItem) => {
        const itemParse = JSON.parse(sortItem)
        const [field, direction] = itemParse
        query.addOrderBy(`${tableName}.${field}`, direction)
      })
    }
  }
}

function applyRange(
  query: SelectQueryBuilder<unknown>,
  range: string,
  tableName: string,
  fieldKey = 'price'
) {
  if (!isEmpty(range)) {
    const [from, to] = JSON.parse(range)
    if (from) {
      query.andWhere(`${tableName}.${fieldKey} >= :from`, { from })
    }
    if (to) {
      query.andWhere(`${tableName}.${fieldKey} <= :to`, { to })
    }
  }
}

export {
  toSlug,
  vndFormatter,
  removeEmpty,
  applySearch,
  applyFilter,
  applySort,
  applyRange
}
