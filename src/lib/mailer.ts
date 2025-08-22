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

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  // Ensure the resetLink doesn't contain 'undefined'
  if (resetLink.includes('undefined')) {
    console.error('Invalid reset link detected:', resetLink);
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    resetLink = resetLink.replace('http://undefined', baseUrl);
    console.log('Fixed reset link:', resetLink);
  }
  
  // Make sure there are no spaces in the reset link
  resetLink = resetLink.trim();
  
  // Log the final reset link for debugging
  console.log('Sending password reset email with link:', resetLink);
 
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
    subject: 'Reset your password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #16213e; text-align: center;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password for your Chill Campus account. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #16213e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Reset Your Password</a>
        </div>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request this password reset, you can safely ignore this email. Your password won't be changed.</p>
        <p>Regards,<br>The Chill Campus Team</p>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; text-align: center;">
          <p>If the button doesn't work, copy and paste this URL into your browser:</p>
          <p style="word-break: break-all;">${resetLink}</p>
        </div>
      </div>
    `
  };

  console.log('Sending password reset email to:', to);
  await transporter.sendMail(mailOptions);
  console.log('Password reset email sent!');
}
