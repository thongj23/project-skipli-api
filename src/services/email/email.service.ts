import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendSetupEmail = async (to: string, employeeId: string) => {
  const baseUrl =
    process.env.CLIENT_BASE_URL || 'http://localhost:3000'; 

  const setupLink = `${baseUrl}/setup-password?employeeId=${employeeId}`;

  const mailOptions = {
    from: `"Your Company" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your Employee Account is Ready',
    html: `
      <h3>Welcome to our system</h3>
      <p>Your employee ID: <strong>${employeeId}</strong></p>
      <p>Please click the link below to set your password:</p>
      <a href="${setupLink}" target="_blank" rel="noopener noreferrer">${setupLink}</a>
    `,
  };

  await transporter.sendMail(mailOptions);
};
