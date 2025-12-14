/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

import { Elysia, t } from 'elysia'

import { Resend } from 'resend'

import { authExtractCredentials, authMiddleware } from '#guiho/app/auth/auth-middleware'
import { clearCredentialsSetCookie, serializeCredentialsToSetCookie } from '#guiho/app/auth/credentials'
import { SESSION_DURATION } from '#guiho/app/auth/session-cookie'
import type { DependencyInjection } from '#guiho/app/dependency-injection'
import type { EmailCode } from '@guiho40/guiho'
import { emailCodeCacheKey, emailCodeSchema, session, sessionCacheKey, user, userSchema } from '@guiho40/guiho'
import { ISODate } from '@guiho40/iso-8601'
import { contacts, formatEmailContact, templates } from '@guiho40/maria'
import { generateId, generateNumericId, parseJson, typeboxParseOrNull, type Language } from '@guiho40/sensacional'
import { Span } from '@guiho40/time'
import { eq } from 'drizzle-orm'

import { firebaseAdminApplication } from '#guiho/app/auth/firebase-admin'
import { preferencesMiddleware } from '#guiho/app/preferences-middleware.js'
import { getAuth } from 'firebase-admin/auth'

export {
  authenticateUser,
  authService,
  EMAIL_CODE_EXPIRATION,
  EMAIL_CODE_MAX_ATTEMPTS,
  sendSignInEmailCode,
  verifyEmailCode,
}
export type {}

const EMAIL_CODE_EXPIRATION = Span.minutes(15)
const EMAIL_CODE_MAX_ATTEMPTS = 3 as const

function authService(di: DependencyInjection) {
  const { valkey } = di
  const logger = di.logger.child('auth.ts')

  return new Elysia({ name: 'auth', prefix: '/auth' })
    .use(preferencesMiddleware(di))
    .use(authExtractCredentials(di))
    .onBeforeHandle(async ({ credentials, status }) => {
      if (!credentials) return
      logger.error('Authenticated request to auth service.')
      return status(400)
    })

    .post(
      'google',
      async ({ body, status, set }) => {
        const auth = getAuth(firebaseAdminApplication())
        const decodedToken = await auth.verifyIdToken(body.idToken)

        if (!decodedToken?.email || !decodedToken?.email_verified) return status(401, null)

        const email = decodedToken.email

        const { setCookieString, user: record } = await authenticateUser(email, di, {
          label: 'google-sign-in',
          description: 'Google Sign In',
        })

        logger.implement('Send sign-in notification to user via email.')

        // Set Cookie Header
        set.headers = { 'Set-Cookie': setCookieString }
        return status(200, record)
      },
      {
        body: t.Object({
          idToken: t.String(),
        }),
        response: {
          200: userSchema,
          401: t.Null(),
        },
      },
    )

    .post(
      'email/send-code',
      async ({ body, status, language }) => {
        const email = body.email

        const emailCode = await sendSignInEmailCode({ email, language }, di)
        if (emailCode === null) {
          logger.task.fail('Failed to send sign-in code to email: ', email)
          return status(500, { success: false } as const)
        }
        return status(200, { success: true } as const)
      },
      {
        body: t.Object({
          email: t.String({ format: 'email' }),
        }),
      },
    )
    .post(
      'email/sign-in',
      async ({ body, set, status }) => {
        const email = body.email

        const key = emailCodeCacheKey(email)
        const codeIsValid = await verifyEmailCode({ di, email, code: body.code, cacheKey: key })

        if (!codeIsValid) return status(401, { success: false, errorId: 'invalid-code' } as const)

        await valkey.del(key)

        // Authenticate User
        const { setCookieString } = await authenticateUser(email, di, {
          label: 'email-sign-in',
          description: 'Email Sign In',
        })

        logger.implement('Send sign-in notification to user via email.')

        // Set Cookie Header
        set.headers = { 'Set-Cookie': setCookieString }
        return status(200, { success: true } as const)
      },
      {
        body: t.Object({
          email: t.String({ format: 'email' }),
          code: t.String(),
        }),
      },
    )

    .use(authMiddleware(di))

    .delete('/sign-out', async ({ session: sessionRecord, status, set }) => {
      await Promise.all([
        di.db.delete(session).where(eq(session.uid, sessionRecord.uid)),
        valkey.del(sessionCacheKey(sessionRecord.uid)),
      ])

      set.headers = { 'Set-Cookie': await clearCredentialsSetCookie(di) }
      return status(200)
    })
}

interface VerifyEmailCodeOptions {
  di: DependencyInjection
  email: string
  code: string
  cacheKey: string
}

async function verifyEmailCode({ di, email, code, cacheKey }: VerifyEmailCodeOptions) {
  // Retrieve Code
  const unsafeEmailCode = await di.valkey.get(cacheKey)
  const storedCode = typeboxParseOrNull(emailCodeSchema, parseJson(unsafeEmailCode))

  // Verify Code
  const codeIsValid =
    storedCode !== null &&
    storedCode.code.trim() === code.trim() &&
    storedCode.email.trim() === email.trim() &&
    storedCode.attempts < EMAIL_CODE_MAX_ATTEMPTS &&
    ISODate.hasNotExpired(storedCode.expiresAt)

  return codeIsValid
}

async function authenticateUser(
  email: string,
  di: DependencyInjection,
  sessionInfo: { label: string; description: string },
) {
  const { valkey, db } = di

  // Clear any pending email codes
  const cacheKey = emailCodeCacheKey(email)
  await valkey.del(cacheKey)

  // Find User
  let record = await db.query.user.findFirst({
    where: eq(user.email, email),
  })

  if (!record) {
    // Create User
    const now = new Date()

    const displayName = email.split('@')[0]
    const username = `${displayName}_${generateId(4)}`

    const [newRecord] = await db
      .insert(user)
      .values({
        email: email,
        username,

        displayName,
        photo: 'https://assets.guiho.co/user.png',

        createdAt: now,
        updatedAt: now,
      })
      .returning()

    record = newRecord
  }

  // Create Session
  const now = new Date()
  const expiresAt = ISODate.now.addDays(SESSION_DURATION.asDays()).toDate()

  const [newSession] = await db
    .insert(session)
    .values({
      userId: record.id,

      label: sessionInfo.label,
      description: sessionInfo.description,

      expiresAt,
      lastUsedAt: now,

      // Location
      latitude: null,
      longitude: null,
      ipv4: null,
      ipv6: null,
      place: null,
      city: null,
      country: null,
      comment: null,

      flags: ['nante40-core'],

      createdAt: now,
      updatedAt: now,
    })
    .returning()

  // Create Cookie
  const credentials = { sessionUid: newSession.uid, userUid: record.uid }
  const setCookieString = await serializeCredentialsToSetCookie(credentials, di)

  return { setCookieString, user: record }
}

async function sendSignInEmailCode(
  { email, language }: { email: string; language: Language },
  di: DependencyInjection,
) {
  const code = generateNumericId(6)
  const now = ISODate.toISOString()

  const emailCode: EmailCode = {
    uid: generateId(16),

    attempts: 0,
    email,
    code,
    expiresAt: ISODate.now.addMinutes(EMAIL_CODE_EXPIRATION.asMinutes()).toISOString(),

    deletedAt: null,
    createdAt: now,
    updatedAt: now,

    _version: '0.0.0',
    _entity: 'guiho.email-otp',
    _shape: 'default',
  }

  // Send Email
  const resend = new Resend(di.secrets.RESEND_API_KEY_SEND_ACCESS)

  const template = templates.auth.signIn

  const emailResponse = await resend.emails.send({
    from: formatEmailContact(contacts.noreply),
    to: email,
    subject: template.getTitle(language),
    html: await template.toHtml({ language, code }),
    text: await template.toText({ language, code }),
  })

  if (emailResponse.error !== null) return null

  // Store Code
  const key = emailCodeCacheKey(email)
  await di.valkey.set(key, JSON.stringify(emailCode), 'EX', EMAIL_CODE_EXPIRATION.asSeconds())
  return emailCode
}
