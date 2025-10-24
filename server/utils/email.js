const nodemailer = require('nodemailer');

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  
  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }
  
  // Fallback to Gmail service
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });
}

async function sendEmail(toEmail, subject, htmlBody, textBody) {
  try {
    const transporter = createTransport();
    
    // Verify connection first
    await transporter.verify();
    
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: toEmail,
      subject: subject,
      html: htmlBody,
      text: textBody,
      headers: {
        'X-Mailer': 'FarmConnect-System'
      }
    });
    
    console.log(`✅ Email sent to ${toEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email send failed to ${toEmail}:`, error.message);
    throw error;
  }
}

function buildOtpEmailHtml(code) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px;">
      <div style="background: white; padding: 30px; border-radius: 8px;">
        <h2 style="color: #16a34a; margin-bottom: 20px;">🔐 Your FarmConnect OTP</h2>
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Use this code to complete your login:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #16a34a; letter-spacing: 8px;">${code}</span>
        </div>
        <p style="color: #64748b; font-size: 14px; margin-top: 20px;">This code expires in 5 minutes.</p>
        <p style="color: #64748b; font-size: 12px; margin-top: 20px;">If you didn't request this code, please ignore this email.</p>
      </div>
    </div>
  `;
}

function buildWelcomeEmailHtml(name, role) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🌾 Welcome to FarmConnect!</h1>
      </div>
      <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hi ${name},</p>
        <p style="font-size: 16px; color: #555; line-height: 1.6;">Your account has been created successfully as a <strong style="color: #16a34a;">${role}</strong>.</p>
        <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #166534; font-size: 14px;">
            ${role === 'farmer' 
              ? '🚜 You can now start adding products, managing inventory, and connecting with customers!' 
              : '🛒 You can now browse fresh products from local farmers and place orders!'}
          </p>
        </div>
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">Thank you for joining our community!</p>
        <p style="color: #64748b; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">This is an automated notification email. No action required.</p>
      </div>
    </div>
  `;
}

module.exports = {
  sendEmail,
  buildOtpEmailHtml,
  buildWelcomeEmailHtml
};
