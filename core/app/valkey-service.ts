/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

import type { DependencyInjection } from '#guiho/app/dependency-injection'
import { Elysia } from 'elysia'

export { valkeyService }
export type {}

function valkeyService(di: DependencyInjection) {
  const { valkey, variables } = di

  return new Elysia({ name: 'valkey-service', prefix: '/valkey' })
    .onBeforeHandle(({ status }) => {
      const allowedModes = ['local', 'stage']
      if (!allowedModes.includes(variables.GUIHO_APP_MODE)) {
        return status(403, 'Forbidden: Valkey service is only available in local or stage environments.')
      }
      return
    })
    .get('/keys', async () => {
      const keys = await valkey.keys('*')
      return { keys }
    })
  // .get('/all', async () => {
  //   const keys = await valkey.keys('*')
  //   if (keys.length === 0) {
  //     return { data: {} }
  //   }

  //   const values = await valkey.mget(...keys)
  //   const data: Record<string, string | null> = {}

  //   keys.forEach((key, index) => {
  //     data[key] = values[index]
  //   })

  //   return { data }
  // })
  // .delete('/flush', async () => {
  //   await valkey.flushdb()
  //   return { success: true, message: 'Valkey database flushed.' }
  // })
  // .post(
  //   '/',
  //   async ({ body }) => {
  //     const { key, value } = body
  //     await valkey.set(key, value)
  //     return { success: true, key, value }
  //   },
  //   {
  //     body: t.Object({
  //       key: t.String(),
  //       value: t.String(),
  //     }),
  //   },
  // )
  // .get(
  //   '/:key',
  //   async ({ params: { key } }) => {
  //     const value = await valkey.get(key)
  //     return { key, value }
  //   },
  //   {
  //     params: t.Object({
  //       key: t.String(),
  //     }),
  //   },
  // )
}
