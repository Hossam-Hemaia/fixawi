const nodemailer = require("nodemailer");

exports.tokenCreator = () => {
  try {
    const resetCode = Math.floor(Math.random() * 1000000);
    const code = resetCode.toString().padStart(6, "0");
    const date = Date.now();
    const codeExpiry = date + 60 * 60 * 1000;
    return { code, codeExpiry };
  } catch (err) {
    throw new Error(err);
  }
};

exports.emailSender = async (email, verificationCode, emailType = "reset") => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });
  let emailOptions;
  if (emailType === "confirmation") {
    emailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Fixawi Confirmation Email",
      text: `Welcom aboard! please use this 6 digit code to confrim your email
      Your Code is: ${verificationCode}
      `,
    };
  } else {
    emailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Fixawi Reset Password Confirmation",
      text: `Welcom aboard! please use this 6 digit code to confrim your email
      Your Code is: ${resetCode}
      `,
    };
  }
  const emailStatus = await transporter.sendMail(emailOptions);
  console.log(emailStatus);
};
