const { sendToToken, sendToMultipleTokens } = require('../services/fcmService');
const {
  getTokenByEmail,
  getAllTokens,
  getManufacturingRequest,
} = require('../services/firestoreService');

// ─────────────────────────────────────────────────────────────
// POST /api/notifications/send-to-user
// Send a notification to a single user by email
// ─────────────────────────────────────────────────────────────
async function sendToUser(req, res) {
  const { email, title, body, data } = req.body;

  if (!email || !title || !body) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: email, title, body',
    });
  }

  const token = await getTokenByEmail(email);
  if (!token) {
    return res.status(404).json({
      success: false,
      error: `No FCM token found for user: ${email}`,
    });
  }

  const messageId = await sendToToken(token, title, body, data || {});

  return res.status(200).json({
    success: true,
    message: `Notification sent to ${email}`,
    messageId,
  });
}

// ─────────────────────────────────────────────────────────────
// POST /api/notifications/send-to-token
// Send directly to a raw FCM token (useful for testing)
// ─────────────────────────────────────────────────────────────
async function sendToRawToken(req, res) {
  const { token, title, body, data } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: token, title, body',
    });
  }

  const messageId = await sendToToken(token, title, body, data || {});

  return res.status(200).json({
    success: true,
    message: 'Notification sent to token',
    messageId,
  });
}

// ─────────────────────────────────────────────────────────────
// POST /api/notifications/broadcast
// Send a notification to ALL users who have an FCM token
// ─────────────────────────────────────────────────────────────
async function broadcast(req, res) {
  const { title, body, data } = req.body;

  if (!title || !body) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: title, body',
    });
  }

  const users = await getAllTokens();

  if (users.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'No users with FCM tokens found',
    });
  }

  const tokens = users.map((u) => u.token);
  const response = await sendToMultipleTokens(tokens, title, body, data || {});

  return res.status(200).json({
    success: true,
    message: `Broadcast sent to ${users.length} users`,
    successCount: response.successCount,
    failureCount: response.failureCount,
  });
}

// ─────────────────────────────────────────────────────────────
// POST /api/notifications/availability-changed
// Called when a manufacturing request availability changes.
// Reads requestId from body, looks up requestedBy email,
// fetches token, sends appropriate notification.
// ─────────────────────────────────────────────────────────────
async function availabilityChanged(req, res) {
  const { requestId } = req.body;

  if (!requestId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: requestId',
    });
  }

  // Fetch the request document from Firestore
  const request = await getManufacturingRequest(requestId);
  if (!request) {
    return res.status(404).json({
      success: false,
      error: `Manufacturing request not found: ${requestId}`,
    });
  }

  const { requestedBy, boardName, quantity, availability } = request;

  if (!requestedBy) {
    return res.status(400).json({
      success: false,
      error: 'Request document has no requestedBy field',
    });
  }

  // Build human-readable status
  let statusText;
  if (availability === 'available') {
    statusText = 'is now available ✅';
  } else if (availability === 'not_available') {
    statusText = 'is not available ❌';
  } else {
    statusText = `status changed to: ${availability}`;
  }

  const title = 'Manufacturing Request Update';
  const body  = `${boardName ?? 'Your request'} (x${quantity ?? 0}) ${statusText}`;

  // Fetch FCM token for the user
  const token = await getTokenByEmail(requestedBy);
  if (!token) {
    return res.status(404).json({
      success: false,
      error: `No FCM token for user: ${requestedBy}`,
    });
  }

  const messageId = await sendToToken(token, title, body, {
    requestId,
    availability: availability ?? '',
    boardName: boardName ?? '',
  });

  return res.status(200).json({
    success: true,
    message: `Notification sent to ${requestedBy}`,
    messageId,
    notificationBody: body,
  });
}

module.exports = {
  sendToUser,
  sendToRawToken,
  broadcast,
  availabilityChanged,
};