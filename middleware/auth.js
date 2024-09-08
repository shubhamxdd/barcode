const jwt = require("jsonwebtoken");

const SECRET_KEY = "secret"; // Replace with secure secret

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name, role: user.role },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
};

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // decode and verify token
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    // console.log(decoded);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = { generateToken, verifyToken };
