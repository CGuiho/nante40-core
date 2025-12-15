/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

/**
 * File name: pg.ts
 * Relative file path: core\app\pg.ts
 * The relative path is the file path on workspace or folder.
 */

import postgres from 'postgres'

export { getPostgreSQL }

interface Credentials {
  PG_HOST: string
  PG_PORT: number
  PG_USER: string
  PG_DATABASE: string
  PG_PASSWORD: string
}

/**
 * Creates a PostgreSQL client instance using `postgres.js`.
 *
 * This function initializes a `postgres` instance (which manages a connection pool)
 * using the provided credentials.
 *
 * @remarks
 * SSL is hardcoded to `false` in the client configuration.
 * `postgres.js` handles connections lazily by default.
 *
 * @param credentials - An object containing the PostgreSQL connection secrets (PG_HOST, PG_PORT, etc.).
 * @param ensureConnectivity - If true, executes a simple query ('SELECT 1') to verify/establish the connection immediately.
 * @default ensureConnectivity true
 * @returns A promise that resolves to a `postgres.Sql` instance.
 *
 * @example
 * ```typescript
 * // Get a client instance
 * const sql = await getPostgreSQL(creds);
 *
 * try {
 *   // Run a query
 *   const result = await sql`SELECT NOW()`;
 *   console.log(result);
 * } finally {
 *   // Close the connection (pool)
 *   await sql.end();
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Get a client and ensure connection is open immediately
 * const sql = await getPostgreSQL(creds, true);
 *
 * // ... perform operations ...
 *
 * // Close the session later
 * await sql.end();
 * ```
 */
async function getPostgreSQL(credentials: Credentials, ensureConnectivity = true) {
  const sql = postgres({
    host: credentials.PG_HOST,
    port: credentials.PG_PORT,
    user: credentials.PG_USER,
    database: credentials.PG_DATABASE,
    password: credentials.PG_PASSWORD,

    ssl: false,
  })

  // postgres.js is lazy, we verify connectivity.
  if (ensureConnectivity) {
    await sql`SELECT 1`
  }

  return sql
}
