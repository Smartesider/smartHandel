export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://smartesider.no');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { fullName, companyName, organizationNumber, email, packageName, price } = req.body;

  if (!fullName || !email || !packageName || !price) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const customerResponse = await fetch(`https://api.fiken.no/v1/customers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FIKEN_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: fullName,
        organization_name: companyName,
        organization_number: organizationNumber,
        email: email
      })
    });

    const customerData = await customerResponse.json();

    if (!customerResponse.ok) {
      throw new Error(customerData.message || 'Failed to create or find customer');
    }

    const invoiceResponse = await fetch(`https://api.fiken.no/v1/invoices`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FIKEN_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customer_id: customerData.id,
        lines: [
          {
            description: packageName,
            amount: price,
            quantity: 1
          }
        ],
        status: 'draft'
      })
    });

    if (!invoiceResponse.ok) {
      const invoiceData = await invoiceResponse.json();
      throw new Error(invoiceData.message || 'Failed to create invoice');
    }

    res.status(200).json({ message: 'Invoice created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}