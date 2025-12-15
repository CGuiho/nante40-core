import Valkey from 'iovalkey'

import packageJson from '../package.json' assert { type: 'json' }

import type { Secrets, Variables } from '#guiho/app/environment.js'
import type { GuihoDatabase } from '@guiho40/guiho/server'
import type { Logger } from '@guiho40/logger'
import type { Nante40Database } from '@guiho40/nante40/server'
import type { Sql } from 'postgres'

export {}
export type { DependencyInjection }

/**
 * @section Dependency Injection
 */
interface DependencyInjection {
  packageJson: typeof packageJson

  logger: Logger
  secrets: Secrets
  variables: Variables
  /** Valkey instance. -- iovalkey, ioredis alternative. */
  valkey: Valkey
  
  guihoPostgreSQL: Sql
  nante40PostgreSQL: Sql

  /**
   * @alias nante40Db
   * GUIHO Nante40 Database instance.
   * Drizzle ORM Database instance -- PostgreSQL under the hood
   */
  db: Nante40Database
  
  /**
   * GUIHO Nante40 Database instance.
   * Drizzle ORM Database instance -- PostgreSQL under the hood
  */
  nante40Db: Nante40Database

  /**
   * GUIHO Database instance.
   * Drizzle ORM Database instance -- PostgreSQL under the hood
   */
  guihoDb: GuihoDatabase
}
