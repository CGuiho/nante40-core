/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

/**
 * File name: pg.ts
 * Relative file path: core\app\pg.ts
 * The relative path is the file path on workspace or folder.
 */

import type { Secrets } from '#guiho/app/environment'
import pg from 'pg'

export { getPostgreSQL }

/**
 * Creates and optionally connects to a PostgreSQL client instance.
 *
 * This function initializes a new `pg.Client` using connection details
 * from the provided environment object or by fetching them from the
 * application's environment via `getEnvironment()`.
 *
 * @remarks
 * SSL is hardcoded to `false` in the client configuration.
 *
 * @param env - Optional. An object containing the PostgreSQL connection secrets (PG_HOST, PG_PORT, etc.). If not provided, `getEnvironment()` is called.
 * @param shouldConnect - Determines whether to connect the client to the database before returning it.
 * @default shouldConnect true
 * @returns A promise that resolves to a `pg.Client` instance. The client will be connected if `shouldConnect` is true.
 *
 * @example
 * ```typescript
 * // Get a connected client and run a query
 * const client = await getPostgreSQL();
 * try {
 *   const res = await client.query('SELECT NOW()');
 *   console.log(res.rows[0]);
 * } finally {
 *   await client.end();
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Get an unconnected client
 * const client = await getPostgreSQL(process.env, false);
 * // Manually connect later
 * await client.connect();
 * // ...
 * await client.end();
 * ```
 */
async function getPostgreSQL(secrets: Secrets, shouldConnect = false) {
  const client = new pg.Client({
    host: secrets.PG_HOST,
    port: secrets.PG_PORT,
    user: secrets.PG_USER,
    database: secrets.PG_DATABASE,
    password: secrets.PG_PASSWORD,

    ssl: false,
  })
  if (shouldConnect) await client.connect()
  return client
}
