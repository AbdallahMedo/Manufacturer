const { getDb } = require('../config/firebase');

/**
 * Get the FCM token stored for a user by their email.
 * Matches your Firestore structure: users/{email}/fcmToken
 *
 * @param {string} email
 * @returns {Promise<string|null>}
 */
async function getTokenByEmail(email) {
  const snapshot = await getDb()
    .collection('users')
    .where('email', '==', email)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return snapshot.docs[0].data().fcmToken || null;
}

/**
 * Get FCM tokens for ALL users in the users collection.
 * Useful for broadcasting to everyone.
 *
 * @returns {Promise<Array<{email: string, token: string}>>}
 */
async function getAllTokens() {
  const snapshot = await getDb().collection('users').get();
  const results = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.fcmToken && data.email) {
      results.push({ email: data.email, token: data.fcmToken });
    }
  });

  return results;
}

/**
 * Get the manufacturing request document by its Firestore ID.
 *
 * @param {string} requestId
 * @returns {Promise<object|null>}
 */
async function getManufacturingRequest(requestId) {
  const doc = await getDb().collection('manufacturing_requests').doc(requestId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

module.exports = { getTokenByEmail, getAllTokens, getManufacturingRequest };