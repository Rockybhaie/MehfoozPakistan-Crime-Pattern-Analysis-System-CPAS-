const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Access denied. No token provided or incorrect format",
    });
  }

  try {
    const actualToken = token.split(" ")[1]; // Remove 'Bearer' and get the token
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
    req.user = decoded;
    console.log(decoded);
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
};
