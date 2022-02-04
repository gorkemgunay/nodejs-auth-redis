const jwt = require("jsonwebtoken");

const verifyAccessToken = (req, res, next) => {
  const authorization = req.headers["authorization"];

  if (!authorization) {
    return res.send("Not authenticated.");
  }
  try {
    const token = authorization.split(" ")[1];
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.payload = payload;
  } catch (err) {
    return res.send("Not authenticated.");
  }
  return next();
};

module.exports = verifyAccessToken;
