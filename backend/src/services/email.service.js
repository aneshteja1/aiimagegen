import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

const FROM = process.env.EMAIL_FROM || '"AI Fashion Studio" <noreply@aifashionstudio.com>';
const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';

/** Send password reset email */
export async function sendPasswordResetEmail(toEmail, rawToken, fullName) {
  const resetUrl = `${FRONTEND}/reset-password?token=${rawToken}`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f5;margin:0;padding:32px 16px">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;border:1px solid #e5e5e5">
    <h1 style="font-size:22px;font-weight:700;color:#171717;margin:0 0 8px">Reset your password</h1>
    <p style="color:#525252;font-size:15px;margin:0 0 24px">Hi ${fullName || 'there'},</p>
    <p style="color:#525252;font-size:15px;margin:0 0 24px">
      We received a request to reset the password for your AI Fashion Studio account.
      Click the button below to choose a new password.
    </p>
    <a href="${resetUrl}"
       style="display:inline-block;background:#171717;color:#fff;text-decoration:none;
              padding:12px 24px;border-radius:8px;font-size:15px;font-weight:600">
      Reset Password
    </a>
    <p style="color:#a3a3a3;font-size:13px;margin:24px 0 0">
      This link expires in 60 minutes. If you didn't request this, you can safely ignore this email.
    </p>
    <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0">
    <p style="color:#a3a3a3;font-size:12px;margin:0">
      © AI Fashion Studio. If the button doesn't work, copy this link:<br>
      <a href="${resetUrl}" style="color:#525252">${resetUrl}</a>
    </p>
  </div>
</body>
</html>`;

  await getTransporter().sendMail({
    from: FROM,
    to: toEmail,
    subject: 'Reset your AI Fashion Studio password',
    html,
    text: `Reset your password: ${resetUrl}\n\nThis link expires in 60 minutes.`,
  });
}

/** Send welcome / account pending email */
export async function sendWelcomeEmail(toEmail, fullName) {
  const html = `
<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,sans-serif;background:#f5f5f5;padding:32px 16px">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;border:1px solid #e5e5e5">
    <h1 style="font-size:22px;font-weight:700;color:#171717;margin:0 0 16px">Welcome, ${fullName}!</h1>
    <p style="color:#525252;font-size:15px;margin:0 0 16px">
      Your AI Fashion Studio account has been created and is pending admin approval.
      You'll receive another email once your account is approved.
    </p>
    <a href="${FRONTEND}/login"
       style="display:inline-block;background:#171717;color:#fff;text-decoration:none;
              padding:12px 24px;border-radius:8px;font-size:15px;font-weight:600">
      Go to Login
    </a>
  </div>
</body>
</html>`;

  await getTransporter().sendMail({
    from: FROM,
    to: toEmail,
    subject: 'Welcome to AI Fashion Studio — account pending approval',
    html,
    text: `Hi ${fullName}, your account is pending approval. We'll notify you when it's approved.`,
  });
}

/** Send account approved email */
export async function sendApprovalEmail(toEmail, fullName) {
  const html = `
<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,sans-serif;background:#f5f5f5;padding:32px 16px">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;border:1px solid #e5e5e5">
    <h1 style="font-size:22px;font-weight:700;color:#171717;margin:0 0 16px">Your account is approved! 🎉</h1>
    <p style="color:#525252;font-size:15px;margin:0 0 16px">
      Hi ${fullName}, your AI Fashion Studio account has been approved. You can now log in and start generating.
    </p>
    <a href="${FRONTEND}/login"
       style="display:inline-block;background:#171717;color:#fff;text-decoration:none;
              padding:12px 24px;border-radius:8px;font-size:15px;font-weight:600">
      Log In Now
    </a>
  </div>
</body>
</html>`;

  await getTransporter().sendMail({
    from: FROM,
    to: toEmail,
    subject: 'Your AI Fashion Studio account is approved',
    html,
    text: `Hi ${fullName}, your account has been approved. Log in at: ${FRONTEND}/login`,
  });
}
