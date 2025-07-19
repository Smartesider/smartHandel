const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://smartesider.no');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { customerDetails, packageName, priceExVat, vatAmount, totalPrice, orderId, invoiceId } = req.body;

    try {
      // Create transporter (using Gmail as example - configure with your email service)
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER, // Add to Vercel env vars
          pass: process.env.EMAIL_PASS, // Add to Vercel env vars
        },
      });

      const emailHTML = `
<!DOCTYPE html>
<html lang="no">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bekreftelse på din bestilling - Smarte Sider</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .success-icon {
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            color: #2d3748;
            margin-bottom: 20px;
        }
        
        .order-summary {
            background: #f7fafc;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
            border-left: 4px solid #667eea;
        }
        
        .order-summary h3 {
            color: #2d3748;
            font-size: 18px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .order-details {
            background: white;
            border-radius: 6px;
            padding: 20px;
            margin-top: 15px;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .detail-row:last-child {
            border-bottom: none;
            font-weight: 600;
            font-size: 16px;
            color: #2d3748;
        }
        
        .detail-label {
            color: #718096;
        }
        
        .detail-value {
            color: #2d3748;
            font-weight: 500;
        }

        .customer-details {
            background: #f0fff4;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
            border: 1px solid #9ae6b4;
        }

        .customer-details h3 {
            color: #22543d;
            font-size: 18px;
            margin-bottom: 15px;
        }

        .customer-info {
            background: white;
            border-radius: 6px;
            padding: 20px;
            margin-top: 15px;
        }
        
        .next-steps {
            background: linear-gradient(135deg, #e6fffa 0%, #f0fff4 100%);
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
            border: 1px solid #9ae6b4;
        }
        
        .next-steps h3 {
            color: #22543d;
            font-size: 18px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .steps-list {
            margin: 0;
            padding-left: 0;
            list-style: none;
        }
        
        .steps-list li {
            padding: 8px 0;
            padding-left: 25px;
            position: relative;
            color: #2d3748;
        }
        
        .steps-list li::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #38a169;
            font-weight: bold;
            font-size: 16px;
        }
        
        .contact-section {
            background: #fff5f5;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
            border: 1px solid #fed7d7;
        }
        
        .contact-section h3 {
            color: #c53030;
            font-size: 18px;
            margin-bottom: 10px;
        }
        
        .contact-section p {
            color: #2d3748;
            margin-bottom: 10px;
        }
        
        .contact-info {
            background: white;
            border-radius: 6px;
            padding: 15px;
            margin-top: 10px;
        }
        
        .footer {
            background: #2d3748;
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .footer h3 {
            margin-bottom: 15px;
            color: #e2e8f0;
        }
        
        .footer p {
            opacity: 0.8;
            margin-bottom: 10px;
        }
        
        .social-links {
            margin-top: 20px;
        }
        
        .social-links a {
            color: #667eea;
            text-decoration: none;
            margin: 0 10px;
            font-weight: 500;
        }
        
        @media (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 8px;
            }
            
            .header,
            .content,
            .footer {
                padding: 25px 20px;
            }
            
            .order-summary,
            .customer-details,
            .next-steps,
            .contact-section {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="success-icon">✓</div>
            <h1>Bestilling bekreftet!</h1>
            <p>Takk for at du valgte Smarte Sider</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Hei ${customerDetails.contactPerson}!
            </div>
            
            <p>Tusen takk for din bestilling hos Smarte Sider! Vi er glade for å ha ${customerDetails.companyName} som kunde og ser frem til å levere en fantastisk nettside som overgår dine forventninger.</p>
            
            <div class="order-summary">
                <h3>📋 Din bestilling</h3>
                <div class="order-details">
                    <div class="detail-row">
                        <span class="detail-label">Pakke:</span>
                        <span class="detail-value">${packageName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Pris (eks. mva):</span>
                        <span class="detail-value">kr ${priceExVat.toLocaleString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">MVA (25%):</span>
                        <span class="detail-value">kr ${vatAmount.toLocaleString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Bestillings-ID:</span>
                        <span class="detail-value">${orderId}</span>
                    </div>
                    ${invoiceId ? `<div class="detail-row">
                        <span class="detail-label">Faktura-ID:</span>
                        <span class="detail-value">${invoiceId}</span>
                    </div>` : ''}
                    <div class="detail-row">
                        <span class="detail-label">Dato:</span>
                        <span class="detail-value">${new Date().toLocaleDateString('no-NO')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Total (inkl. mva):</span>
                        <span class="detail-value">kr ${totalPrice.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div class="customer-details">
                <h3>👤 Kundedetaljer</h3>
                <div class="customer-info">
                    <div class="detail-row">
                        <span class="detail-label">Firmanavn:</span>
                        <span class="detail-value">${customerDetails.companyName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Org.nr:</span>
                        <span class="detail-value">${customerDetails.orgNumber}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Kontaktperson:</span>
                        <span class="detail-value">${customerDetails.contactPerson}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">E-post:</span>
                        <span class="detail-value">${customerDetails.email}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Telefon:</span>
                        <span class="detail-value">${customerDetails.phone}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Adresse:</span>
                        <span class="detail-value">${customerDetails.address}, ${customerDetails.zipCode} ${customerDetails.city}</span>
                    </div>
                    ${customerDetails.comment ? `<div class="detail-row">
                        <span class="detail-label">Kommentar:</span>
                        <span class="detail-value">${customerDetails.comment}</span>
                    </div>` : ''}
                </div>
            </div>
            
            <div class="next-steps">
                <h3>🚀 Hva skjer nå?</h3>
                <ul class="steps-list">
                    <li><strong>Umiddelbart:</strong> Du mottar denne bekreftelsen</li>
                    <li><strong>Innen 2 timer:</strong> Vår prosjektleder kontakter deg</li>
                    <li><strong>Innen 24 timer:</strong> Vi planlegger første møte</li>
                    <li><strong>Innen 48 timer:</strong> Design og utvikling starter</li>
                    <li><strong>Underveis:</strong> Regelmessige oppdateringer og previews</li>
                </ul>
            </div>
            
            <div class="contact-section">
                <h3>💬 Trenger du hjelp?</h3>
                <p>Vårt team er her for å hjelpe deg 24/7!</p>
                <div class="contact-info">
                    <p><strong>📧 E-post:</strong> hjelp@skydash.no</p>
                    <p><strong>📱 Telefon:</strong> +47 123 45 678</p>
                    <p><strong>💬 Chat:</strong> Tilgjengelig på smartesider.no</p>
                </div>
            </div>
            
            <p>Vi gleder oss til å jobbe med ${customerDetails.companyName} og skape noe fantastisk sammen!</p>
            
            <p style="margin-top: 30px;">
                Med vennlig hilsen,<br>
                <strong>Team Smarte Sider</strong><br>
                <em>Din partner for digital suksess</em>
            </p>
        </div>
        
        <div class="footer">
            <h3>Smarte Sider</h3>
            <p>Vi skaper nettsider som konverterer</p>
            <p>📧 hjelp@skydash.no | 📱 +47 123 45 678</p>
            
            <div class="social-links">
                <a href="#">Facebook</a> |
                <a href="#">LinkedIn</a> |
                <a href="#">Instagram</a>
            </div>
            
            <p style="font-size: 12px; margin-top: 20px; opacity: 0.7;">
                © 2024 Smarte Sider. Alle rettigheter forbeholdt.
            </p>
        </div>
    </div>
</body>
</html>`;

      const mailOptions = {
        from: `"Smarte Sider" <${process.env.EMAIL_USER}>`,
        to: customerDetails.email,
        bcc: 'hjelp@skydash.no',
        subject: `✅ Bestilling bekreftet - ${packageName} - ${customerDetails.companyName} - ID: ${orderId}`,
        html: emailHTML,
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({ 
        success: true, 
        message: 'Confirmation email sent successfully' 
      });

    } catch (error) {
      console.error('Email error:', error);
      res.status(500).json({ error: 'Failed to send email', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};