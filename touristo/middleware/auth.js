const { verifyToken } = require('../utils/jwtUtils');
const { query } = require('../config/database');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'Access token required'
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // Attach user info to request object
    next();
  } catch (error) {
    // 401 = not authenticated (expired/invalid). 403 is reserved for
    // "authenticated but not allowed", so clients can end the session
    // on 401 without logging users out for ordinary permission denials.
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Loads the caller's CURRENT role from the database.
 * Returns { role } | { missing: true } | { failed: true }.
 */
const loadCurrentRole = async (userId) => {
  try {
    const result = await query('SELECT role FROM users WHERE id = $1', [
      userId
    ]);

    if (!result.rows.length) {
      return { missing: true };
    }

    return { role: result.rows[0].role };
  } catch (error) {
    console.error('Role lookup failed:', error.message);
    return { failed: true };
  }
};

/**
 * Role gate. Must be mounted AFTER authenticateToken.
 *
 * The role is ALWAYS re-read from the database. JWTs live for 7 days, so
 * trusting the embedded role would let a demoted or deleted account keep
 * its privileges until the token expired.
 *
 * 401 - account no longer exists
 * 403 - authenticated but the current role is not allowed
 * 503 - the role could not be verified (fail closed)
 */
const requireRole = (...roles) => async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'fail',
      message: 'Access token required',
    });
  }

  const current = await loadCurrentRole(req.user.id);

  if (current.failed) {
    return res.status(503).json({
      status: 'error',
      message: 'Could not verify your access. Please try again.',
    });
  }

  if (current.missing) {
    return res.status(401).json({
      status: 'fail',
      message: 'Account no longer exists',
    });
  }

  req.user.role = current.role;

  if (!roles.includes(current.role)) {
    return res.status(403).json({
      status: 'fail',
      message: 'You are not authorized to perform this action',
    });
  }

  next();
};

/**
 * Refreshes `req.user.role` from the database without rejecting on role
 * mismatch. Mounted on routes whose controllers branch on `req.user.role`
 * for authorization (self-or-admin, host-only, traveler-only, ...), so a
 * stale token role can never grant access.
 */
const syncRole = async (req, res, next) => {
  if (!req.user?.id) {
    return next();
  }

  const current = await loadCurrentRole(req.user.id);

  if (current.failed) {
    return res.status(503).json({
      status: 'error',
      message: 'Could not verify your access. Please try again.',
    });
  }

  if (current.missing) {
    return res.status(401).json({
      status: 'fail',
      message: 'Account no longer exists',
    });
  }

  req.user.role = current.role;
  next();
};

/**
 * Attaches req.user when a valid token is supplied, but never rejects.
 * Used on public read endpoints that return extra detail to the owner.
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      req.user = verifyToken(token);
    } catch (error) {
      // Invalid/expired token on a public endpoint: continue anonymously.
      req.user = undefined;
    }
  }

  next();
};

module.exports = { authenticateToken, requireRole, optionalAuth, syncRole };
