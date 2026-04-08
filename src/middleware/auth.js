/**
 * Simple API key middleware.
 * Every request must include:
 *   Header:  x-api-key: <API_SECRET_KEY from .env>
 */
function apiKeyAuth(req, res, next) {
  const key = req.headers['x-api-key'];

  if (!key || key !== process.env.API_SECRET_KEY) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized — invalid or missing API key',
    });
  }

  next();
}

module.exports = apiKeyAuth;