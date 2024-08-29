const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "mail.docinfo.pk",
  port: "465",
  secure:'ssl',
  auth: {
    user: "suportdoinfo@docinfo.pk",
    pass: "imr$an1345!@$%",
  },
  debug: true,
});

module.exports = transporter;
