/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

import { getSessionCookie } from '#guiho/app/auth/session-cookie'
import type { Secrets, Variables } from '#guiho/app/environment'
import { parseJson, typeboxParseOrNull } from '@guiho40/sensacional'
import { Type } from '@sinclair/typebox/type'

export {
  clearCredentialsSetCookie,
  extractCredentials,
  extractCredentialsFromAuthorizationHeader,
  extractCredentialsFromCookieHeader,
  parseCredentials,
  serializeCredentialsToAuthorizationHeader,
  serializeCredentialsToSetCookie,
  stringifyCredentials,
}
export type { Credentials }

interface Options {
  secrets: Secrets
  variables: Variables
}

/**
 * Credentials Protocol
 * 40<session-max><session-id><user-id>
 * <session-max> is the length of the session ID, from 000 to 999
 * <session-id> is at most 999 characters long
 * <user-id> has variable length
 */

const credentialsSchema = Type.Object({
  sessionUid: Type.String({ minLength: 1, maxLength: 999 }),
  userUid: Type.String({ minLength: 1 }),
})

type Credentials = typeof credentialsSchema.static

/**
 * Serializes the credentials object into a JSON string.
 *
 * @param credentials - The credentials object containing sessionUid and userUid.
 * @returns The serialized credentials string.
 */
function stringifyCredentials(credentials: Credentials) {
  const valid = typeboxParseOrNull(credentialsSchema, credentials)
  if (!valid) return null

  return JSON.stringify(credentials)
}

/**
 * Parses a serialized credentials string back into a Credentials object.
 * Assumes the session ID is always 64 characters long starting at index 2.
 *
 * @param credentials - The serialized credentials string.
 * @returns The parsed Credentials object.
 */
function parseCredentials(credentials: string): Credentials | null {
  const parsed = typeboxParseOrNull(credentialsSchema, parseJson(credentials))
  if (!parsed) return null
  return parsed
}

/**
 * Extracts credentials from the request object.
 * It first attempts to retrieve credentials from the 'Authorization' header.
 * If not found, it falls back to the 'Cookie' header.
 *
 * @param request - The request object to extract credentials from.
 * @returns A promise that resolves to the Credentials object if found, or null otherwise.
 */
async function extractCredentials(request: Request, options: Options): Promise<Credentials | null> {
  const authorizationHeader = request.headers.get('Authorization')
  const credentialsFromAuthorizationHeader = await extractCredentialsFromAuthorizationHeader(authorizationHeader || '')

  if (credentialsFromAuthorizationHeader) return credentialsFromAuthorizationHeader

  const cookieHeader = request.headers.get('Cookie')
  const credentialsFromCookieHeader = await extractCredentialsFromCookieHeader(cookieHeader || '', options)

  if (credentialsFromCookieHeader) return credentialsFromCookieHeader

  return null
}

/**
 * Extracts credentials from the 'Cookie' header string.
 * Uses the session cookie configuration to parse the header.
 *
 * @param cookieHeader - The 'Cookie' header string.
 * @returns A promise that resolves to the Credentials object if successfully parsed, or null otherwise.
 */
async function extractCredentialsFromCookieHeader(cookieHeader: string, options: Options): Promise<Credentials | null> {
  const { secrets, variables } = options

  const cookie = getSessionCookie(secrets, variables.GUIHO_APP_MODE)

  const credentialsId = await cookie.parse(cookieHeader)
  if (!credentialsId) return null

  const credentials = parseCredentials(credentialsId)
  return credentials
}

/**
 * Extracts credentials from the 'Authorization' header string.
 * Expects the header value to be in a format where the credentials are the second part (e.g., "Bearer <credentials>").
 *
 * @param authorizationHeader - The 'Authorization' header string.
 * @returns A promise that resolves to the Credentials object if successfully parsed, or null otherwise.
 */
async function extractCredentialsFromAuthorizationHeader(authorizationHeader: string): Promise<Credentials | null> {
  const credentials = authorizationHeader.split(' ')[1]
  if (!credentials) return null
  return parseCredentials(credentials)
}

/**
 * Serializes the given value to a string and returns the `Set-Cookie` header.
 */
async function serializeCredentialsToSetCookie(credentials: Credentials, options: Options) {
  const { secrets, variables } = options

  const cookie = getSessionCookie(secrets, variables.GUIHO_APP_MODE)

  const credentialsId = stringifyCredentials(credentials)
  return cookie.serialize(credentialsId)
}

/**
 * Serializes the given value to a string and returns the `Authorization` header.
 */
function serializeCredentialsToAuthorizationHeader(credentials: Credentials) {
  const credentialsId = stringifyCredentials(credentials)
  return `Bearer ${credentialsId}`
}

/**
 * Serializes an empty value to a string and returns the `Set-Cookie` header.
 * This is typically used to clear the session cookie.
 */
function clearCredentialsSetCookie(options: Options) {
  const { secrets, variables } = options

  const cookie = getSessionCookie(secrets, variables.GUIHO_APP_MODE)

  return cookie.serialize(null)
}
