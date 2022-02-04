const jwt = require("jsonwebtoken");
const client = require("../config/redisConfig");

const createAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

const createRefreshToken = async (userId) => {
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  await client.SET(userId, refreshToken);
  await client.EXPIRE(userId, 7 * 24 * 60 * 60);
  return refreshToken;
};

const sendRefreshToken = (res, token) => {
  return res.cookie("uid", token, {
    httpOnly: true,
  });
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
};
