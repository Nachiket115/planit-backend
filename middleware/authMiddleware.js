import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  let token;

  // Check if token is in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request (excluding password)
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      console.error("Auth error:", error);
      res.status(401).json({ message: "Not authorized, invalid token" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

export default protect;
