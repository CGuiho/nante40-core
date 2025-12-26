/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

import { Type } from '@sinclair/typebox'

export { DEFAUlT_PAGE, DEFAULT_SIZE, MAX_SIZE, paginationFullSchema, paginationSchema, thresholds }
export type { Pagination, PaginationFull }

const DEFAUlT_PAGE = 1 as const
const DEFAULT_SIZE = 10 as const

const MAX_SIZE = 1000 as const
const MAX_PAGE = 1_000_000_000 as const

const pageSchema = Type.Number({ minimum: 1, maximum: MAX_PAGE, default: DEFAUlT_PAGE })
const sizeSchema = Type.Number({ minimum: 1, maximum: MAX_SIZE, default: DEFAULT_SIZE })

const paginationSchema = Type.Object({
  page: pageSchema,
  size: sizeSchema,
})

const paginationFullSchema = Type.Object({
  page: pageSchema,
  size: sizeSchema,
  total: Type.Number({ minimum: 0 }),
})

type Pagination = typeof paginationSchema.static

type PaginationFull = typeof paginationFullSchema.static

/**
 * Calculates the limit and offset for pagination.
 * This is commonly used to construct database queries for paginated results.
 */
function thresholds(pagination: Pagination) {
  const { page, size } = pagination
  const limit = size
  const offset = (page - 1) * size
  return { limit, offset, page, size }
}
