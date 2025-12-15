import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'kpi-reports-secret-key-change-in-production';

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // Bearer <token>
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Middleware to check if user is admin or adminDeveloper
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Both 'admin' and 'adminDeveloper' roles have admin access
  if (req.user.role !== 'admin' && req.user.role !== 'adminDeveloper') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
};

// Middleware to check if user is adminDeveloper (for user management)
export const requireAdminDeveloper = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Only 'adminDeveloper' role can manage users
  if (req.user.role !== 'adminDeveloper') {
    return res.status(403).json({ error: 'Admin Developer access required' });
  }
  
  next();
};

// Combined middleware: verify token and require admin
export const adminOnly = [verifyToken, requireAdmin];

// Combined middleware: verify token and require adminDeveloper
export const adminDeveloperOnly = [verifyToken, requireAdminDeveloper];

export default { verifyToken, requireAdmin, requireAdminDeveloper, adminOnly, adminDeveloperOnly };
