import nodemailer from 'nodemailer';

export async function sendActivationEmail(to: string, activationLink: string) {
 
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, 
      pass: process.env.GMAIL_PASS, 
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject: 'Activate your account',
    html: `<p>Thank you for registering! Please click the link below to activate your account:</p>
           <a href="${activationLink}">${activationLink}</a>`
  };

  console.log('Sending activation email to:', to, 'with link:', activationLink);
  await transporter.sendMail(mailOptions);
  console.log('Activation email sent!');
}
