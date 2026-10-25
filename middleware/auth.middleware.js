
import jwt from "jsonwebtoken";
import User from "../models/auth.model.js";

export const authMiddleware = async (req, res, next) => {
  try {
    // 1. Get the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        msg: "Token is required",
      });
    }

    // 2. Extract the token
    const token = authHeader.split(" ")[1];

    // 3. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Find the user in MongoDB
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        msg: "User not found",
      });
    }

    // 5. Attach the user to the request
    req.user = user;

    // 6. Continue to the controller
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);

    return res.status(401).json({
      success: false,
      msg: "Invalid or expired token",
    });
  }
};

export default authMiddleware;
