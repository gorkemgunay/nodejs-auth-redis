const express = require("express");
const router = express.Router();
const {
  register,
  login,
  me,
  refreshToken,
  verifyEmail,
  sendEmailVerificationMail,
  logout,
  passwordReset,
  sendPasswordResetMail,
} = require("../controllers/userController");
const isAuth = require("../middlewares/isAuth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", isAuth, me);
router.get("/refresh-token", isAuth, refreshToken);
router.post("/verify-email", sendEmailVerificationMail);
router.get("/verify-email/:id/:token", verifyEmail);
router.post("/password-reset", sendPasswordResetMail);
router.post("/password-reset/:id/:token", passwordReset);
router.get("/logout", isAuth, logout);

module.exports = router;
