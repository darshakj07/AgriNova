import nodemailer from 'nodemailer';

const createTransporter = (user, pass) => nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user,
    pass
  }
});

const getVerificationEmailTemplate = (email, otpCode, purpose = 'verification') => {
  const titleText = purpose === 'password_reset' ? 'Reset your AgriNova password' : 'Verify your email address';
  const descriptionText = purpose === 'password_reset'
    ? `We received a request to reset your password for <strong>${email}</strong>. Use the code below to create a new password.`
    : `We sent a one-time verification code to <strong>${email}</strong>. Enter the code below to confirm your email and complete registration.`;
  const noteText = purpose === 'password_reset'
    ? 'This code is valid for 5 minutes. If you did not request a password reset, please ignore this email.'
    : 'This code is valid for 5 minutes. If you did not request it, please ignore this email.';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AgriNova ${purpose === 'password_reset' ? 'Password Reset' : 'Email Verification'}</title>
  <style>
    body {
      background-color: #EFF4EE;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #263238;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 580px;
      margin: 32px auto;
      border-radius: 28px;
      overflow: hidden;
      background-color: #ffffff;
      box-shadow: 0 22px 60px rgba(15, 23, 42, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #1B5E20, #43A047);
      padding: 32px 28px;
      text-align: center;
    }
    .brand-block {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      justify-content: center;
    }
    .brand-title {
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 24px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -0.5px;
    }
    .brand-highlight {
      color: #C8E6C9;
    }
    .subheader {
      margin-top: 10px;
      color: #D8F4D8;
      font-size: 13px;
      letter-spacing: 0.3px;
    }
    .content {
      padding: 36px 32px 28px;
      text-align: center;
    }
    .title {
      font-size: 22px;
      font-weight: 800;
      margin: 0 0 14px;
      color: #102027;
    }
    .description {
      font-size: 15px;
      line-height: 1.8;
      color: #455A64;
      margin: 0 0 28px;
    }
    .otp-box {
      display: block;
      width: fit-content;
      margin: 0 auto 26px;
      padding: 18px 32px;
      border-radius: 18px;
      border: 1px solid rgba(67, 160, 71, 0.25);
      background-color: #F1F8F2;
      font-size: 34px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #2E7D32;
      text-align: center;
    }
    .note {
      font-size: 13px;
      color: #607D8B;
      line-height: 1.7;
    }
    .footer {
      background-color: #F3F8F3;
      padding: 22px 24px;
      text-align: center;
      border-top: 1px solid rgba(66, 165, 79, 0.12);
      font-size: 11px;
      color: #78909C;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .footer strong {
      color: #455A64;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-block">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 18C8.5 18 5.9 13.8 3.8 8.7L5.7 8L7.4 11.5C11.5 11.2 17.5 13.5 21 19C22 21 22.5 22 22 22C20.5 22 18 20.5 17 18H13Z" fill="#FFFFFF"/>
        </svg>
        <span class="brand-title">Agri<span class="brand-highlight">Nova</span></span>
      </div>
      <div class="subheader">Secure verification for your AgriNova account</div>
    </div>
    <div class="content">
      <h2 class="title">${titleText}</h2>
      <p class="description">${descriptionText}</p>
      <div class="otp-box">${otpCode}</div>
      <p class="note">${noteText}</p>
    </div>
    <div class="footer">AgriNova • Protecting your farm data with secure email verification</div>
  </div>
</body>
</html>
`;
};

export const sendVerificationEmail = async (email, otpCode, purpose = 'verification') => {
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.trim();

  if (!emailUser || !emailPass) {
    throw new Error('Email service is not configured. Set EMAIL_USER and EMAIL_PASS in .env');
  }

  const transporter = createTransporter(emailUser, emailPass);
  await transporter.verify();
  const subject = purpose === 'password_reset'
    ? `AgriNova Password Reset Code: ${otpCode}`
    : `AgriNova Verification Code: ${otpCode}`;

  const mailOptions = {
    from: `"AgriNova Support" <${emailUser}>`,
    to: email,
    subject,
    html: getVerificationEmailTemplate(email, otpCode, purpose)
  };

  return transporter.sendMail(mailOptions);
};

export const sendAccountBlockEmail = async (email, name, isBlocked, reason) => {
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.trim();

  if (!emailUser || !emailPass) {
    throw new Error('Email service is not configured. Set EMAIL_USER and EMAIL_PASS in .env');
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });

  await transporter.verify();

  const statusText = isBlocked ? 'Blocked/Suspended' : 'Unblocked/Restored';
  const subject = `AgriNova Account Status Update: ${statusText}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>AgriNova Account Status Update</title>
  <style>
    body {
      background-color: #EFF4EE;
      font-family: 'Inter', sans-serif;
      color: #263238;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 580px;
      margin: 32px auto;
      border-radius: 28px;
      background-color: #ffffff;
      box-shadow: 0 22px 60px rgba(15, 23, 42, 0.08);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #b71c1c, #d32f2f);
      padding: 32px 28px;
      text-align: center;
      color: #ffffff;
    }
    .header.unblocked {
      background: linear-gradient(135deg, #1B5E20, #43A047);
    }
    .brand-title {
      font-size: 24px;
      font-weight: 900;
    }
    .content {
      padding: 36px 32px 28px;
      text-align: center;
    }
    .title {
      font-size: 20px;
      font-weight: 800;
      color: #102027;
      margin-bottom: 16px;
    }
    .description {
      font-size: 15px;
      line-height: 1.8;
      color: #455A64;
      text-align: left;
    }
    .reason-box {
      margin: 20px 0;
      padding: 16px;
      background-color: #ffebee;
      border-left: 4px solid #d32f2f;
      border-radius: 8px;
      text-align: left;
      font-size: 14px;
      color: #c62828;
      font-weight: bold;
    }
    .reason-box.unblocked {
      background-color: #e8f5e9;
      border-left: 4px solid #2e7d32;
      color: #2e7d32;
    }
    .footer {
      background-color: #F3F8F3;
      padding: 22px 24px;
      text-align: center;
      border-top: 1px solid rgba(66, 165, 79, 0.12);
      font-size: 11px;
      color: #78909C;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header ${!isBlocked ? 'unblocked' : ''}">
      <span class="brand-title">AgriNova Account Status Update</span>
    </div>
    <div class="content">
      <h2 class="title">Hello ${name},</h2>
      <p class="description">
        Your account status on the AgriNova platform has been updated by the administrator. 
        Please review the details below:
      </p>
      <div class="reason-box ${!isBlocked ? 'unblocked' : ''}">
        <strong>Status:</strong> ${statusText}<br/>
        <strong>Admin Reason/Note:</strong> ${reason || 'No details provided.'}
      </div>
      <p class="description">
        ${isBlocked 
          ? 'If you believe this action was taken in error or want to appeal, please reach out to AgriNova Merchant Relations support.' 
          : 'Your credentials have been fully restored. You can now login to the platform.'}
      </p>
    </div>
    <div class="footer">AgriNova Support • Secure Trading & Escrow Portal</div>
  </div>
</body>
</html>
  `;

  const mailOptions = {
    from: `"AgriNova Support" <${emailUser}>`,
    to: email,
    subject,
    html: htmlContent
  };

  return transporter.sendMail(mailOptions);
};
