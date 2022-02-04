const Joi = require("joi");

const userSchema = Joi.object({
  email: Joi.string().lowercase().email().required(),
  password: Joi.string().min(6).required(),
});

const isEmailSchema = Joi.object({
  email: Joi.string().lowercase().email().required(),
});

const passwordResetSchema = Joi.object({
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({ "any.only": "Passwords do not match." }),
});

module.exports = { userSchema, isEmailSchema, passwordResetSchema };
