/* ============================================
   Auth Middleware - Gowtham Paints
   ============================================ */

// Simple auth middleware that extracts user info from the request
// In production, you'd verify Firebase tokens with firebase-admin

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No authentication token provided' });
    }

    // For now, we'll decode the basic info from the token
    // In production, use firebase-admin to verify the token
    const token = authHeader.split(' ')[1];
    
    // Store token for later use with Firebase Admin
    req.userToken = token;
    
    // Try to get user from database by checking headers or token
    // For development, we'll accept the token and proceed
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = authMiddleware;
