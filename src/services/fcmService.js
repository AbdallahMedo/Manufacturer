const { getMessaging } = require('../config/firebase');

/**
 * Send a push notification to a single FCM token.
 *
 * @param {string} fcmToken   - Device FCM token
 * @param {string} title      - Notification title
 * @param {string} body       - Notification body
 * @param {object} data       - Optional extra key/value data payload
 * @returns {Promise<string>} - FCM message ID on success
 */
async function sendToToken(fcmToken, title, body, data = {}) {
  const message = {
    token: fcmToken,
    notification: { title, body },
    data: stringifyData(data),          // FCM data payload must be all strings
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        channelId: 'request_updates_channel',
      },
    },
    apns: {
      payload: {
        aps: { sound: 'default' },
      },
    },
  };

  const response = await getMessaging().send(message);
  return response; // FCM message ID
}

/**
 * Send to multiple tokens at once (up to 500 per FCM batch limit).
 *
 * @param {string[]} tokens
 * @param {string}   title
 * @param {string}   body
 * @param {object}   data
 * @returns {Promise<admin.messaging.BatchResponse>}
 */
async function sendToMultipleTokens(tokens, title, body, data = {}) {
  const message = {
    tokens,
    notification: { title, body },
    data: stringifyData(data),
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        channelId: 'request_updates_channel',
      },
    },
    apns: {
      payload: {
        aps: { sound: 'default' },
      },
    },
  };

  const response = await getMessaging().sendEachForMulticast(message);
  return response;
}

/** FCM data values must all be strings */
function stringifyData(obj) {
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    result[k] = String(v);
  }
  return result;
}

module.exports = { sendToToken, sendToMultipleTokens };