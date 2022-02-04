const nodemailer = require("nodemailer");

const passwordResetMail = async (email, userId, token) => {
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const info = await transporter.sendMail({
    from: '"Gorkem Gunay 👻" <foo@example.com>', // sender address
    to: `${email}`, // list of receivers
    subject: "Password Reset", // Subject line
    html: `Your password reset link: <a href="http://localhost:4000/user/password-reset/${userId}/${token}">Click Here</a>`, // html body
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};

module.exports = passwordResetMail;
