const admin = require('firebase-admin');

let initialized = false;

function initFirebase() {
  if (initialized) return;

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
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
