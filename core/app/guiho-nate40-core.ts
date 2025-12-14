/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

import { Elysia } from 'elysia'

import cors from '@elysiajs/cors'
import openapi, { fromTypes } from '@elysiajs/openapi'

import { appLogger } from '#guiho/app/app-logger'
import { secretsSchema, variablesSchema } from '#guiho/app/environment'

import { APP_ORIGIN, CORS_ALLOWED_ORIGINS } from '#guiho/app/constants'
import packageJson from '../package.json' assert { type: 'json' }

import { getPostgreSQL } from '#guiho/app/pg'
import { getValkey } from '#guiho/app/valkey'
import { typeboxParseOrThrow } from '@guiho40/sensacional'

import { authService } from '#guiho/app/auth/auth'
import { sessionService } from '#guiho/app/auth/session'
import { chatService } from '#guiho/app/chat-service'
import type { DependencyInjection } from '#guiho/app/dependency-injection'
import { pingService } from '#guiho/app/ping'
import { userService } from '#guiho/app/user'
import { valkeyService } from '#guiho/app/valkey-service'
import { getGuihoDatabase } from '@guiho40/guiho/server'
import { getNante40Database } from '@guiho40/nante40/server'

export { }
export type { GuihoCore }

const logger = appLogger
const variables = typeboxParseOrThrow(variablesSchema, process.env)
const secrets = typeboxParseOrThrow(secretsSchema, process.env)

/**
 * @section Compile TypeBox Validators
 */

/**
 * @section Open Connection to Services
 */
const valkey = getValkey(secrets)
const guihoPostgreSQL = await getPostgreSQL({...secrets, PG_DATABASE: secrets.GUIHO_PG_DATABASE })
const nante40PostgreSQL = await getPostgreSQL({...secrets, PG_DATABASE: secrets.NANTE40_PG_DATABASE })

await Promise.all([
  guihoPostgreSQL.connect(),
  nante40PostgreSQL.connect(),
])

const guihoDb = getGuihoDatabase(guihoPostgreSQL)
const nante40Db = getNante40Database(nante40PostgreSQL)

/**
 * @section Dependency Injection
 */

const dependencyInjection: DependencyInjection = {
  packageJson,

  logger,
  secrets,
  variables,
  valkey,

  guihoPostgreSQL,
  nante40PostgreSQL,

  db: nante40Db,
  guihoDb,
  nante40Db,
}

async function cleanUp() {
  logger.task.start('Cleaning up resources...')
  await Promise.all([
    guihoPostgreSQL.end(),
    nante40PostgreSQL.end(),
    valkey.quit(),
  ])
  logger.task.success('Resources cleaned up.')
}

/* prettier-ignore */
const app = new Elysia()
	.use(cors({ origin: Array.from(CORS_ALLOWED_ORIGINS) }))
  .use(openapi({
      references: fromTypes(),
      documentation: { info: { title: "GUIHO Nante40 Core API", version: packageJson.version, description: "API documentation for GUIHO Nante40 Core" }, 
      servers: [{ url: `http://localhost:${variables.PORT}` }, { url: APP_ORIGIN }] }
  }))

  .decorate('di', dependencyInjection)

  .get('/', () => 'Cristóvão GUIHO')
  .use(pingService(dependencyInjection))
  .use(authService(dependencyInjection))
  .use(userService(dependencyInjection))  
  
  .use(sessionService(dependencyInjection))
  
  .use(chatService(dependencyInjection))
  // .use(organizationService(dependencyInjection))

  .use(valkeyService(dependencyInjection))
  
  .onStart(({ server, decorator }) => decorator.di.logger.pulse(`running at http://localhost:${server?.port}`))
  .onStop(async ({ decorator }) => {
    decorator.di.logger.pulse('Stopping application...')
    decorator.di.logger.task.start('shutting down...')
    await cleanUp()
    decorator.di.logger.task.success('shutdown complete.')
  })
  .listen({ port: variables.PORT, hostname: '0.0.0.0' })

type GuihoCore = typeof app

/**
 * @section  Handle Graceful Shutdown
 */
const cleanUpSignals = ['exit', 'SIGINT', 'SIGTERM', 'SIGKILL'] as const

for (const signal of cleanUpSignals) {
  process.on(signal, async () => {
    console.log(`${signal} received, stopping app...`)
    await app.stop()
    await cleanUp()
  })
}
