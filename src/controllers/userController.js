const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
} = require("../helpers/jwt");
const client = require("../config/redisConfig");
const {
  userSchema,
  passwordResetSchema,
  isEmailSchema,
} = require("../helpers/validationSchema");
const emailVerificationMail = require("../helpers/emailVerificationMail");
const passwordResetMail = require("../helpers/passwordResetMail");

const register = async (req, res) => {
  try {
    const { email, password } = await userSchema.validateAsync(req.body);
    const doesExist = await User.findOne({ where: { email: email } });
    if (doesExist) {
      return res.send("User aldready signed in.");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, password: hashedPassword });
    const token = jwt.sign({}, process.env.EMAIL_TOKEN_SECRET, {
      expiresIn: "1d",
    });
    await client.SET(`email_${newUser.id}`, token);
    await client.EXPIRE(newUser.id, 1 * 24 * 60 * 60);
    await emailVerificationMail(newUser.email, newUser.id, token);
    return res.send(newUser);
  } catch (error) {
    return res.send(error.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = await userSchema.validateAsync(req.body);
    const user = await User.findOne({ where: { email: email } });
    if (user) {
      if (user.validateEmail) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          const accessToken = createAccessToken(user.id);
          const refreshToken = await createRefreshToken(user.id);
          sendRefreshToken(res, refreshToken);
          return res.send({ accessToken });
        }
        return res.send("Email or password wrong.");
      }
      return res.send("Please verify your email.");
    }
    return res.send("User not found.");
  } catch (error) {
    return res.send(error.message);
  }
};

const me = async (req, res) => {
  const userId = req.payload.userId;
  const user = await User.findByPk(userId, {
    attributes: { exclude: ["password"] },
  });
  if (user.validateEmail) {
    return res.send(user);
  }
  return res.send("Error.");
};

const refreshToken = async (req, res) => {
  const token = req.cookies.uid;
  if (token) {
    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    if (payload) {
      const redisToken = await client.GET(payload.userId);
      if (redisToken === token) {
        const accessToken = createAccessToken(payload.userId);
        const refreshToken = await createRefreshToken(payload.userId);
        sendRefreshToken(res, refreshToken);
        return res.send({ accessToken });
      }
      return res.send("Invalid token.");
    }
    return res.send("Not authenticated.");
  }
  return res.send("Not authenticated.");
};

const sendEmailVerificationMail = async (req, res) => {
  try {
    const { email } = await isEmailSchema.validateAsync(req.body);
    const user = await User.findOne({ where: { email } });
    if (user && !user.validateEmail) {
      const token = jwt.sign({}, process.env.EMAIL_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      await client.SET(`email_${user.id}`, token);
      await client.EXPIRE(user.id, 1 * 24 * 60 * 60);
      await emailVerificationMail(user.email, user.id, token);
      return res.send({ token });
    }
    return res.send("Your email already verified.");
  } catch (error) {
    return res.send(error.message);
  }
};

const verifyEmail = async (req, res) => {
  const { id, token } = req.params;
  const user = await User.findByPk(id);
  if (!user.validateEmail) {
    const redisToken = await client.GET(`email_${id}`);
    if (redisToken === token) {
      await user.update({ validateEmail: true });
      await client.DEL(`email_${id}`);
      return res.send(true);
    }
    return res.send("Invalid token.");
  }
  return res.send("Your email already verified.");
};

const sendPasswordResetMail = async (req, res) => {
  try {
    const { email } = await isEmailSchema.validateAsync(req.body);
    const user = await User.findOne({ where: { email } });
    if (user && user.validateEmail) {
      const token = jwt.sign({}, process.env.PASSWORD_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      await client.SET(`password_${user.id}`, token);
      await client.EXPIRE(user.id, 1 * 24 * 60 * 60);
      await passwordResetMail(user.email, user.id, token);
      return res.send({ token });
    }
    return res.send("First you must verify your email.");
  } catch (error) {
    return res.send(error.message);
  }
};

const passwordReset = async (req, res) => {
  try {
    const { id, token } = req.params;
    const { password, confirmPassword } =
      await passwordResetSchema.validateAsync(req.body);
    if (password === confirmPassword) {
      const redisToken = await client.GET(`password_${id}`);
      if (redisToken === token) {
        const user = await User.findByPk(id);
        const newPassword = await bcrypt.hash(password, 10);
        await user.update({ password: newPassword });
        await client.DEL(`password_${id}`);
        return res.send(true);
      }
      return res.send("Invalid token.");
    }
    return res.send("Password must be match.");
  } catch (error) {
    return res.send(error.message);
  }
};

const logout = async (req, res) => {
  try {
    const token = req.cookies.uid;
    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    await client.DEL(payload.userId);
    sendRefreshToken(res, "");
    return res.send(true);
  } catch (error) {
    return res.send(error.message);
  }
};

module.exports = {
  register,
  login,
  me,
  refreshToken,
  sendEmailVerificationMail,
  verifyEmail,
  sendPasswordResetMail,
  passwordReset,
  logout,
};
