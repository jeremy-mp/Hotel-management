import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader && authHeader.split(" ")[1]; // Bearer <token>
  const token = tokenFromHeader || req.cookies.token;

  // console.log(req.cookies.token);
  
  if (!token) {
    return res.status(401).json({ message: "No Login Yet" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "You are not authorized" });
    req.user = user;
    next();
  });
};

export default verifyToken;
