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
    const { package: packageName, priceExVat, vatAmount, totalPrice, customer } = req.body;

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

      // First, try to find existing customer by organization number
      let customerId = null;
      try {
        const customerSearchResponse = await fetch(`${baseUrl}/contacts?organizationNumber=${customer.orgNumber}`, {
          method: 'GET',
          headers,
        });

        if (customerSearchResponse.ok) {
          const customers = await customerSearchResponse.json();
          if (customers.length > 0) {
            customerId = customers[0].contactId;
            console.log('Found existing customer:', customerId);
          }
        }
      } catch (searchError) {
        console.warn('Customer search failed, will create new:', searchError);
      }

      // If customer not found, create new customer
      if (!customerId) {
        const customerData = {
          name: customer.companyName,
          organizationNumber: customer.orgNumber,
          email: customer.email,
          phoneNumber: customer.phone,
          address: {
            address: customer.address,
            postCode: customer.zipCode,
            city: customer.city,
            country: 'Norge'
          },
          contactPerson: customer.contactPerson,
          customer: true,
          supplier: false
        };

        const customerResponse = await fetch(`${baseUrl}/contacts`, {
          method: 'POST',
          headers,
          body: JSON.stringify(customerData),
        });

        if (!customerResponse.ok) {
          const errorText = await customerResponse.text();
          console.error('Customer creation error:', errorText);
          throw new Error('Failed to create customer in Fiken');
        }

        const newCustomer = await customerResponse.json();
        customerId = newCustomer.contactId;
        console.log('Created new customer:', customerId);
      }

      // Generate order ID
      const orderId = 'SS-' + new Date().getFullYear() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();

      // Create invoice
      const invoiceData = {
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
        customerId: customerId,
        lines: [
          {
            description: `${packageName}${customer.comment ? ` - ${customer.comment}` : ''}`,
            unitPrice: priceExVat * 100, // Price excluding VAT in øre
            quantity: 1,
            vatType: 'HIGH', // 25% VAT - Fiken will calculate VAT automatically
            account: '3000', // Standard sales account
          },
        ],
        currency: 'NOK',
        orderReference: orderId,
        project: null,
        cash: false
      };

      const invoiceResponse = await fetch(`${baseUrl}/invoices`, {
        method: 'POST',
        headers,
        body: JSON.stringify(invoiceData),
      });

      if (!invoiceResponse.ok) {
        const errorText = await invoiceResponse.text();
        console.error('Fiken invoice error:', errorText);
        throw new Error('Failed to create invoice in Fiken');
      }

      const invoice = await invoiceResponse.json();

      // Send confirmation email
      try {
        const emailResponse = await fetch(`${req.headers.host.includes('localhost') ? 'http://' : 'https://'}${req.headers.host}/api/send-confirmation-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerDetails: customer,
            packageName,
            priceExVat,
            vatAmount,
            totalPrice,
            orderId,
            invoiceId: invoice.invoiceId
          }),
        });
        
        if (!emailResponse.ok) {
          console.warn('Email sending failed, but invoice created');
        }
      } catch (emailError) {
        console.warn('Email sending error:', emailError);
        // Don't fail the invoice creation if email fails
      }
      
      res.status(200).json({ 
        success: true, 
        message: 'Faktura opprettet successfully',
        invoiceId: invoice.invoiceId,
        orderId: orderId,
        customerId: customerId
      });

    } catch (error) {
      console.error('Fiken error:', error);
      res.status(500).json({ 
        error: 'Internal server error', 
        details: error.message,
        type: 'fiken_error'
      });
    }
  } else {
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};