import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  tls: {
    ciphers: 'SSLv3',
  },
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendEmail = (email: string, userId: string, token: string) => {
  const welcomeMessage = `Welcome to PUB QUIZ

  If you confirm your account you became a host. You will be able to create quizes and host games. Click the following link:
  ${process.env.FRONTEND_URL}/confirm/${userId}/${token}
`;

  const htmlMessage = `
<h2>Welcome to PUB QUIZ</h2>

<p>If you confirm your account you became a host. You will be able to create quizes and host games.</p>

<p>Click the following link to confirm account:</p>

<a href="${process.env.FRONTEND_URL}/confirm/${userId}/${token}" target="_blank">
<button style="background: #b0bfff; color: rgba(0, 0, 0, 0.87); font-size: 15px; height: 50px; text-align: center; padding: 10px 30px; border-radius: 10px; border: none; box-shadow: 0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12); font-weight: bold;">CONFIRM ACCOUNT</button>
</a>

<p style="margin-top: 20px;">or copy this link in a new browser tab:</p>

<a href="${process.env.FRONTEND_URL}/confirm/${userId}/${token}" target="_blank">${process.env.FRONTEND_URL}/confirm/${userId}/${token}</a>
`;

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Welcome to PUB QUIZ',
    text: welcomeMessage,
    html: htmlMessage,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('send mail error', error);
      return { error, message: 'email not send' };
    } else {
      console.log('Email succesfuly sent', info.response);
      return { error, message: 'Email succesfuly sent.' };
    }
  });
};
