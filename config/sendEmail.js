const transporter = require('./emailConfig');
const sendEmail = async (to, subject, html) => {
    const mailOptions = {
      from: "suportdoinfo@docinfo.pk",
      to,
      subject,
      html,
    };
  
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
    } catch (error) {
      console.error('Error sending email:', error);
    }
};

module.exports = sendEmail;