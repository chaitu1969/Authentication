const nodemailer = require("nodemailer");
const asyncErrorHandler = require("./asyncErrorHandler");
const CustomError = require("./customError");

const sendEmail = async (options) => {
  // Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PSWD,
    },
    // logger: true,
    // debug: true,
  });

  const emailOptions = {
    from: "Boundless Books Support <support@boundlessbooks.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  try {
    const info = await transporter.sendMail(emailOptions);
  } catch (error) {
    return new CustomError("something went wrong in sending email", 400);
  }
};

module.exports = sendEmail;
