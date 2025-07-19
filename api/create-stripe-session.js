const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'nok',
              product_data: {
                name: packageName,
              },
              unit_amount: price * 100, // Convert to smallest currency unit
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: 'https://smartesider.no/success.html',
        cancel_url: 'https://smartesider.no/cancel.html',
        customer_email: customerDetails.email,
      });

      res.status(200).json({ url: session.url });
    } catch (error) {
      console.error('Stripe error:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};