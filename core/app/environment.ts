/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

import { GUIHOAppModeSchema } from '@guiho40/sensacional'
import { Type, type Static } from '@sinclair/typebox'

export { environmentSchema, secretsSchema, variablesSchema }
export type { Environment, Secrets, Variables }

const variablesSchema = Type.Object({
  PORT: Type.Number(),
  NODE_ENV: Type.Union([Type.Literal('development'), Type.Literal('production')]),

  GUIHO_APP_MODE: GUIHOAppModeSchema,
})

type Variables = Static<typeof variablesSchema>

const secretsSchema = Type.Object({
  RESEND_API_KEY_SEND_ACCESS: Type.String(),

  SESSION_ENCRYPTION_KEY: Type.String({ minLength: 32, maxLength: 32 }),
  SESSION_SIGNING_KEY: Type.String({ minLength: 32, maxLength: 32 }),

  SESSION_PAST_ENCRYPTION_KEY_0: Type.String({ minLength: 32, maxLength: 32 }),
  SESSION_PAST_ENCRYPTION_KEY_1: Type.String({ minLength: 32, maxLength: 32 }),
  SESSION_PAST_ENCRYPTION_KEY_2: Type.String({ minLength: 32, maxLength: 32 }),
  SESSION_PAST_ENCRYPTION_KEY_3: Type.String({ minLength: 32, maxLength: 32 }),

  SESSION_PAST_SIGNING_KEY_0: Type.String({ minLength: 32, maxLength: 32 }),
  SESSION_PAST_SIGNING_KEY_1: Type.String({ minLength: 32, maxLength: 32 }),
  SESSION_PAST_SIGNING_KEY_2: Type.String({ minLength: 32, maxLength: 32 }),
  SESSION_PAST_SIGNING_KEY_3: Type.String({ minLength: 32, maxLength: 32 }),

  GUIHO_PG_DATABASE: Type.String(),
  NANTE40_PG_DATABASE: Type.String(),

  PG_HOST: Type.String(),
  PG_PORT: Type.Number(),
  PG_USER: Type.String(),
  PG_PASSWORD: Type.String(),

  VALKEY_HOST: Type.String(),
  VALKEY_PORT: Type.Number(),
  VALKEY_PASSWORD: Type.String(),
})

type Secrets = Static<typeof secretsSchema>

const environmentSchema = Type.Intersect([variablesSchema, secretsSchema])

type Environment = Static<typeof environmentSchema>
