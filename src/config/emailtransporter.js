const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "localhost",
  port: 8586,
  tls: {
    rejectUnauthorized: false,
  },
});

module.exports = transporter;
