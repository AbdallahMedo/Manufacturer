const admin = require('firebase-admin');
const path  = require('path');

let initialized = false;

function initFirebase() {
  if (initialized) return;

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';

  const serviceAccount = require(path.resolve(serviceAccountPath));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  initialized = true;
  console.log('✅ Firebase Admin initialized');
}

function getDb() {
  return admin.firestore();
}

function getMessaging() {
  return admin.messaging();
}

module.exports = { initFirebase, getDb, getMessaging };