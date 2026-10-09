const { verifyToken } = require('../utils/jwtUtils');
const { query } = require('../config/database');

/**
 * Admin access guard.
 *
 * 401 - no token, invalid/expired token, or the account no longer exists
 * 403 - a valid token whose user is not currently an admin
 * 503 - the role could not be verified (database unavailable, fail closed)
 *
 * The role is re-read from the database on every admin request. JWTs are
 * stateless and live for 7 days, so trusting the embedded role alone would
 * leave a demoted or deleted admin fully privileged until token expiry.
 */
const requireAdmin = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'Access token required'
    });
  }

  let decoded;

  try {
    decoded = verifyToken(token);
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid or expired token'
    });
  }

  if (!decoded?.id) {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid or expired token'
    });
  }

  let dbRole = null;

  try {
    const result = await query(
      'SELECT role FROM users WHERE id = $1',
      [decoded.id]
    );
    dbRole = result.rows[0]?.role ?? null;
  } catch (err) {
    console.error('Admin role lookup failed:', err.message);
    return res.status(503).json({
      status: 'error',
      message: 'Could not verify admin access. Please try again.'
    });
  }

  if (!dbRole) {
    return res.status(401).json({
      status: 'fail',
      message: 'Account no longer exists'
    });
  }

  if (dbRole !== 'admin') {
    return res.status(403).json({
      status: 'fail',
      message: 'Admin access required'
    });
  }

  req.user = { ...decoded, role: dbRole };

  next();
};

module.exports = {
  requireAdmin
};
