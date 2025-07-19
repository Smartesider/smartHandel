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
    const { package: packageName, priceExVat, vatAmount, totalPrice, customer } = req.body;

    try {
      // Generate order ID
      const orderId = 'SS-' + new Date().getFullYear() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'nok',
              product_data: {
                name: packageName,
                description: `Smarte Sider - ${packageName} (Prisen inkluderer 25% MVA)`,
                metadata: {
                  priceExVat: priceExVat.toString(),
                  vatAmount: vatAmount.toString(),
                  totalPrice: totalPrice.toString()
                }
              },
              unit_amount: totalPrice * 100, // Total price including VAT in øre
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `https://smartesider.no/success.html?package=${encodeURIComponent(packageName)}&price=${totalPrice}&order_id=${orderId}`,
        cancel_url: 'https://smartesider.no/prisliste.html',
        customer_email: customer.email,
        metadata: {
          package: packageName,
          orderId: orderId,
          priceExVat: priceExVat.toString(),
          vatAmount: vatAmount.toString(),
          totalPrice: totalPrice.toString(),
          contactPerson: customer.contactPerson,
          phone: customer.phone,
          companyName: customer.companyName,
          orgNumber: customer.orgNumber,
          address: customer.address,
          zipCode: customer.zipCode,
          city: customer.city,
          comment: customer.comment || ''
        },
        billing_address_collection: 'required',
        invoice_creation: {
          enabled: true,
        }
      });

      // Send confirmation email after successful payment session creation
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
          }),
        });
        
        if (!emailResponse.ok) {
          console.warn('Email sending failed, but payment session created');
        }
      } catch (emailError) {
        console.warn('Email sending error:', emailError);
        // Don't fail the payment if email fails
      }

      res.status(200).json({ url: session.url });
    } catch (error) {
      console.error('Stripe error:', error);
      res.status(500).json({ error: 'Failed to create checkout session', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};