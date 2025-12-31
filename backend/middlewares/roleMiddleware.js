/**
 * Middleware to check if user has required role
 * @param {Array} allowedRoles - Array of allowed roles ['OFFICER', 'VICTIM', 'WITNESS']
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is Officer
 */
const requireOfficer = requireRole(["OFFICER"]);

/**
 * Middleware to check if user is Victim
 */
const requireVictim = requireRole(["VICTIM"]);

/**
 * Middleware to check if user is Witness
 */
const requireWitness = requireRole(["WITNESS"]);

/**
 * Middleware to check if user is Officer or Victim
 */
const requireOfficerOrVictim = requireRole(["OFFICER", "VICTIM"]);

module.exports = {
  requireRole,
  requireOfficer,
  requireVictim,
  requireWitness,
  requireOfficerOrVictim,
};

