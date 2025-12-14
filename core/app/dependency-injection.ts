import Valkey from 'iovalkey'
import type { Client } from 'pg'

import packageJson from '../package.json' assert { type: 'json' }

import type { Secrets, Variables } from '#guiho/app/environment.js'
import type { GuihoDatabase } from '@guiho40/guiho/server'
import type { Logger } from '@guiho40/logger'

export {}
export type { DependencyInjection }

/**
 * @section Dependency Injection
 */
interface DependencyInjection {
  logger: Logger
  secrets: Secrets
  variables: Variables
  /** Valkey instance. -- iovalkey, ioredis alternative. */
  valkey: Valkey
  postgreSQL: Client

  /**
   * @alias guihoDb
   * Nante40 Database instance.
   * Drizzle ORM Database instance -- PostgreSQL under the hood
   */
  db: GuihoDatabase

  /**
   * GUIHO Database instance.
   * Drizzle ORM Database instance -- PostgreSQL under the hood
   */
  guihoDb: GuihoDatabase
  packageJson: typeof packageJson
}
