const { query } = require('../config/database');

/**
 * Shared authorization helpers.
 *
 * Every sensitive action is verified SERVER-SIDE against the database.
 * IDs supplied by the client are never trusted on their own.
 */

const isAdmin = (req) => req.user?.role === 'admin';

const isSelf = (req, userId) =>
  Number(req.user?.id) === Number(userId);

/**
 * Strips credential material from a user row before it is serialized.
 * `password_hash` must NEVER leave the server.
 */
const sanitizeUser = (user) => {
  if (!user) return user;
  const { password_hash, ...safe } = user;
  return safe;
};

/**
 * National ID / license numbers are owner+admin only.
 * Public host listings never expose them.
 */
const PRIVATE_HOST_FIELDS = ['license_number', 'cnic_or_business_registration'];

const sanitizeHost = (host, req) => {
  if (!host) return host;

  const isOwner =
    req?.user?.id !== undefined &&
    Number(host.user_id) === Number(req.user.id);
  const admin = isAdmin(req);

  if (isOwner || admin) return host;

  const safe = { ...host };
  for (const field of PRIVATE_HOST_FIELDS) {
    if (field in safe) safe[field] = null;
  }
  return safe;
};

/**
 * True when the requesting user owns the given host profile
 * (hosts.user_id === req.user.id) or is an admin.
 */
const userOwnsHost = async (req, hostId) => {
  if (isAdmin(req)) return true;
  if (!hostId || !req.user?.id) return false;

  const result = await query(
    'SELECT id FROM hosts WHERE id = $1 AND user_id = $2',
    [hostId, req.user.id]
  );
  return result.rows.length > 0;
};

/**
 * Resolves the host profile owned by the requesting user, if any.
 */
const getHostForUser = async (userId) => {
  const result = await query(
    'SELECT * FROM hosts WHERE user_id = $1 ORDER BY id LIMIT 1',
    [userId]
  );
  return result.rows[0] || null;
};

/**
 * Express middleware factory: allows only the resource owner or an admin.
 * `resolveOwnerId` is an async fn (req) => ownerId|null.
 */
const requireOwnership = (resolveOwnerId) => async (req, res, next) => {
  try {
    if (isAdmin(req)) return next();

    const ownerId = await resolveOwnerId(req);
    if (ownerId !== null && ownerId !== undefined && isSelf(req, ownerId)) {
      return next();
    }

    return res.status(403).json({
      status: 'fail',
      message: 'You are not authorized to perform this action',
    });
  } catch (err) {
    console.error('Authorization check failed:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong. Please try again.',
    });
  }
};

module.exports = {
  isAdmin,
  isSelf,
  sanitizeUser,
  sanitizeHost,
  userOwnsHost,
  getHostForUser,
  requireOwnership,
};
