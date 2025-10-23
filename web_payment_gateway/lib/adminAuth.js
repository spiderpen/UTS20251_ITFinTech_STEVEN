import { verifyToken } from "./jwt";

export function requireAuth(handler) {
  return async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      
      if (!token) {
        return res.status(401).json({ 
          success: false, 
          error: "No token provided" 
        });
      }

      const decoded = verifyToken(token);
      
      if (!decoded) {
        return res.status(401).json({ 
          success: false, 
          error: "Invalid or expired token" 
        });
      }

      // Attach user info to request
      req.admin = decoded;
      
      return handler(req, res);
    } catch (err) {
      return res.status(401).json({ 
        success: false, 
        error: "Authentication failed" 
      });
    }
  };
}