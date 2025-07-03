const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail', // or use SMTP provider like SendGrid / Outlook
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendOTPEmail = async (to, otp) => {
  await transporter.sendMail({
    from: `"Bill Split" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Password Reset OTP",
    text: `Your OTP for password reset is: ${otp}`,
  });
};
