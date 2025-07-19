const fetch = require('node-fetch');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://smartesider.no');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { packageName, price, customerDetails } = req.body;

    try {
      const clientId = process.env.FIKEN_CLIENT_ID;
      const clientSecret = process.env.FIKEN_CLIENT_SECRET;
      const companySlug = process.env.FIKEN_COMPANY_SLUG;
      
      if (!clientId || !clientSecret || !companySlug) {
        throw new Error('Missing Fiken configuration');
      }

      // Get OAuth access token
      const authResponse = await fetch('https://api.fiken.no/api/v2/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
        body: 'grant_type=client_credentials',
      });

      if (!authResponse.ok) {
        const errorText = await authResponse.text();
        console.error('Fiken auth error:', errorText);
        throw new Error('Failed to authenticate with Fiken');
      }

      const authData = await authResponse.json();
      const accessToken = authData.access_token;

      const baseUrl = `https://api.fiken.no/api/v2/companies/${companySlug}`;
      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };

      // Create invoice
      const invoiceData = {
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        lines: [
          {
            description: packageName,
            unitPrice: price * 100, // Convert to øre
            quantity: 1,
            vatType: 'HIGH', // 25% MVA in Norway
          },
        ],
        currency: 'NOK',
      };

      const invoiceResponse = await fetch(`${baseUrl}/invoices`, {
        method: 'POST',
        headers,
        body: JSON.stringify(invoiceData),
      });

      if (!invoiceResponse.ok) {
        const errorText = await invoiceResponse.text();
        console.error('Fiken invoice error:', errorText);
        throw new Error('Failed to create invoice');
      }

      const invoice = await invoiceResponse.json();
      
      res.status(200).json({ 
        success: true, 
        message: 'Faktura opprettet successfully',
        invoiceId: invoice.invoiceId 
      });

    } catch (error) {
      console.error('Fiken error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};