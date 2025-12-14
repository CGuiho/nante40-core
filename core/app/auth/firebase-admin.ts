/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

import { createLogger } from '@guiho40/logger'

import { getApps, initializeApp } from 'firebase-admin/app'

export { firebaseAdminApplication, firebaseAdminApplications }
export type {}

const logger = createLogger('firebase/firebase-admin.ts')

function firebaseAdminApplications() {
  const noAppsHaveBeenInitialized = getApps().length === 0

  if (noAppsHaveBeenInitialized) {
    logger.info('🔥 Initializing Firebase Admin')
    initializeApp()
  }

  return getApps()
}

function firebaseAdminApplication() {
  const apps = firebaseAdminApplications()
  return apps[0]
}
