import { verifyAccessToken } from '../services/auth.service.js';

/** Attach user from JWT to req.user. Returns 401 if missing/invalid. */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const token = authHeader.slice(7);
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
}

/** Require approved account status */
export function requireApproved(req, res, next) {
  if (req.user.status !== 'approved') {
    return res.status(403).json({ error: 'Account not yet approved.' });
  }
  next();
}

/** Require company_admin or superadmin role */
export function requireAdmin(req, res, next) {
  const role = req.user.role;
  if (role !== 'company_admin' && role !== 'superadmin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}

/** Require superadmin role */
export function requireSuperAdmin(req, res, next) {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Super admin access required.' });
  }
  next();
}

/** Ensure user belongs to the requested company (or is superadmin) */
export function requireSameCompany(req, res, next) {
  const companyId = req.params.companyId || req.body.company_id;
  if (req.user.role === 'superadmin') return next();
  if (req.user.company_id !== companyId) {
    return res.status(403).json({ error: 'Access denied to this company.' });
  }
  next();
}
