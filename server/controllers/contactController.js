const nodemailer = require('nodemailer');

// Create email transporter (same as in index.js)
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

// Handle contact form submission
exports.sendContactEmail = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Create email transporter
    const transporter = createTransport();

    // Verify connection
    await transporter.verify();

    // Email content for admin
    const adminEmailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
          }
          .info-row {
            background: white;
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            border-left: 4px solid #16a34a;
          }
          .label {
            font-weight: bold;
            color: #16a34a;
            margin-bottom: 5px;
          }
          .value {
            color: #4b5563;
          }
          .message-box {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            border: 1px solid #d1d5db;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌾 New Contact Form Submission</h1>
          <p style="margin: 0; opacity: 0.9;">FarmConnect Marketplace</p>
        </div>
        <div class="content">
          <p>You have received a new message from the contact form:</p>
          
          <div class="info-row">
            <div class="label">👤 Name:</div>
            <div class="value">${name}</div>
          </div>
          
          <div class="info-row">
            <div class="label">📧 Email:</div>
            <div class="value"><a href="mailto:${email}">${email}</a></div>
          </div>
          
          <div class="info-row">
            <div class="label">📱 Phone:</div>
            <div class="value"><a href="tel:${phone}">${phone}</a></div>
          </div>
          
          <div class="message-box">
            <div class="label">💬 Message:</div>
            <div class="value">${message}</div>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            <strong>Received:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
          </p>
        </div>
        <div class="footer">
          <p>This is an automated message from FarmConnect Contact Form</p>
          <p>© ${new Date().getFullYear()} FarmConnect. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const adminEmailText = `
New Contact Form Submission - FarmConnect

Name: ${name}
Email: ${email}
Phone: ${phone}

Message:
${message}

Received: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
    `;

    // Email content for customer (acknowledgment)
    const customerEmailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
            border-radius: 0 0 10px 10px;
          }
          .message-box {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            border-left: 4px solid #16a34a;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌾 Thank You for Contacting Us!</h1>
          <p style="margin: 0; opacity: 0.9;">FarmConnect Marketplace</p>
        </div>
        <div class="content">
          <p>Dear <strong>${name}</strong>,</p>
          
          <p>Thank you for reaching out to FarmConnect! We have received your message and our team will get back to you as soon as possible.</p>
          
          <div class="message-box">
            <p style="margin: 0 0 10px 0;"><strong>Your Message:</strong></p>
            <p style="margin: 0; color: #4b5563;">${message}</p>
          </div>
          
          <p>We typically respond within 24-48 hours during business hours:</p>
          <ul style="color: #4b5563;">
            <li><strong>Mon - Fri:</strong> 9:00 AM - 6:00 PM</li>
            <li><strong>Saturday:</strong> 10:00 AM - 4:00 PM</li>
            <li><strong>Sunday:</strong> Closed</li>
          </ul>
          
          <p>If you have any urgent concerns, please feel free to call us at <strong>+91 9876543210</strong>.</p>
          
          <p style="margin-top: 30px;">Best regards,<br><strong>The FarmConnect Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated acknowledgment from FarmConnect</p>
          <p>© ${new Date().getFullYear()} FarmConnect. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const customerEmailText = `
Thank You for Contacting Us!

Dear ${name},

Thank you for reaching out to FarmConnect! We have received your message and our team will get back to you as soon as possible.

Your Message:
${message}

We typically respond within 24-48 hours during business hours:
- Mon - Fri: 9:00 AM - 6:00 PM
- Saturday: 10:00 AM - 4:00 PM
- Sunday: Closed

If you have any urgent concerns, please feel free to call us at +91 9876543210.

Best regards,
The FarmConnect Team

© ${new Date().getFullYear()} FarmConnect. All rights reserved.
    `;

    // Get SMTP_FROM from environment or use default
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@farmconnect.com';
    const adminEmail = process.env.SMTP_USER; // Send to the SMTP user email (admin)

    // Send email to admin
    await transporter.sendMail({
      from: fromEmail,
      to: adminEmail,
      subject: `New Contact Form Submission from ${name}`,
      text: adminEmailText,
      html: adminEmailHTML
    });

    // Send acknowledgment email to customer
    await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject: 'Thank You for Contacting FarmConnect',
      text: customerEmailText,
      html: customerEmailHTML
    });

    console.log(`[Contact Form] Email sent successfully from ${name} (${email})`);

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully! We will get back to you soon.'
    });

  } catch (error) {
    console.error('[Contact Form] Error:', error);
    
    // Provide specific error messages
    let errorMessage = 'Failed to send message. Please try again later.';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Email configuration error. Please contact support.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Unable to connect to email server. Please try again later.';
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
