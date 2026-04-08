const express    = require('express');
const router     = express.Router();
const apiKeyAuth = require('../middleware/auth');
const ctrl       = require('../controllers/notificationController');

// All notification routes are protected by API key
router.use(apiKeyAuth);

// ── Routes ──────────────────────────────────────────────────
// Send to a specific user by email
router.post('/send-to-user', asyncWrap(ctrl.sendToUser));

// Send directly to a raw FCM token (good for Postman testing)
router.post('/send-to-token', asyncWrap(ctrl.sendToRawToken));

// Broadcast to all users
router.post('/broadcast', asyncWrap(ctrl.broadcast));

// Triggered when availability changes on a manufacturing request
router.post('/availability-changed', asyncWrap(ctrl.availabilityChanged));

// ── Helper: catch async errors and forward to Express error handler ──
function asyncWrap(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

module.exports = router;