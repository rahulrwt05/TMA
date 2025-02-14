import jwt from "jsonwebtoken";

export const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      console.log("❌ No token found");
      return res.status(401).json({ message: "Authentication required" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log("❌ Token verification failed:", err.message);
        return res.status(401).json({ message: "Invalid or expired token" });
      }
      req.userId = decoded.userId;
      console.log("✅ Token verified, userId:", req.userId);
      next();
    });
  } catch (error) {
    console.error("❌ Auth Middleware Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
