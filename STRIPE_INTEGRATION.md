# Stripe Payment Integration

This document explains how to set up Stripe payments for invoices in the House of Companies dashboard.

## Current Implementation

The current implementation includes:

1. A client-side utility for generating mock payment links
2. UI components for displaying payment buttons on unpaid invoices
3. CSS styling for payment buttons and notification messages

## How to Set Up Full Stripe Integration

To implement a complete Stripe integration, follow these steps:

### 1. Create a Stripe Account

- Sign up at [stripe.com](https://stripe.com)
- Complete the verification process
- Get your API keys from the Stripe Dashboard

### 2. Set Up Server-Side Endpoint

Create a server endpoint to handle payment link creation. This can be done using:

- A serverless function (AWS Lambda, Vercel Functions, etc.)
- An API route in a Next.js application
- A dedicated backend server

Example server code:

```javascript
// Example using Express.js
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

app.post('/api/create-payment-link', async (req, res) => {
  try {
    const { invoice_id, amount, currency, description, customer_email } = req.body;
    
    // Create a payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: description,
            },
            unit_amount: amount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        invoice_id: invoice_id,
      },
      customer_email: customer_email,
    });
    
    res.json({ paymentLink: paymentLink.url });
  } catch (error) {
    console.error('Error creating payment link:', error);
    res.status(500).json({ message: error.message });
  }
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
```

### 3. Update Environment Variables

Add your Stripe API keys to your environment variables:

```
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### 4. Set Up Webhooks

Set up Stripe webhooks to receive payment notifications:

1. In the Stripe Dashboard, go to Developers > Webhooks
2. Add an endpoint URL that points to your webhook handler
3. Subscribe to the following events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

Create a webhook handler endpoint:

```javascript
app.post('/api/stripe-webhook', 
  express.raw({type: 'application/json'}), 
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    try {
      const event = stripe.webhooks.constructEvent(
        req.body, 
        sig, 
        endpointSecret
      );
      
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          // Update invoice status in your database
          await updateInvoiceStatus(
            paymentIntent.metadata.invoice_id, 
            'paid'
          );
          break;
        case 'payment_intent.payment_failed':
          // Handle payment failure
          break;
      }
      
      res.json({received: true});
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

async function updateInvoiceStatus(invoiceId, status) {
  // Update the invoice status in your database
  // Example using Supabase
  const { error } = await supabase
    .from('invoices')
    .update({ payment_status: status === 'paid' })
    .eq('id', invoiceId);
    
  if (error) {
    console.error('Error updating invoice status:', error);
  }
}
```

### 5. Replace the Mock Implementation

Replace the mock implementation in `stripeUtils.js` with actual API calls to your server:

```javascript
export const createStripePaymentLink = async (invoiceData) => {
  try {
    const response = await fetch('/api/create-payment-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invoice_id: invoiceData.invoice_id,
        amount: invoiceData.amount,
        currency: invoiceData.currency,
        description: invoiceData.description,
        customer_email: invoiceData.customer_email
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create payment link');
    }
    
    const data = await response.json();
    return {
      success: true,
      paymentLink: data.paymentLink
    };
  } catch (error) {
    console.error('Error creating payment link:', error);
    throw error;
  }
};
```

## Testing Payments

To test payments in Stripe:

1. Use Stripe test mode
2. Use Stripe test card numbers:
   - 4242 4242 4242 4242 (Visa, successful payment)
   - 4000 0000 0000 9995 (Visa, declined payment)
3. Use any future expiration date and any 3-digit CVC

## Database Schema

Make sure your `invoices` table has these fields:

- `payment_status` (boolean) - Whether the invoice is paid
- `stripe_payment_link` (string) - The URL to the Stripe payment page
- `stripe_payment_id` (string) - The Stripe payment ID for reference

## Additional Considerations

- **Security**: Ensure your server properly validates requests
- **Error Handling**: Implement comprehensive error handling for payment failures
- **Notifications**: Set up email notifications for payment events
- **Reporting**: Consider adding payment reporting features
- **Refunds**: Implement refund handling if needed

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Payment Links](https://stripe.com/docs/payment-links)
- [Stripe Webhooks](https://stripe.com/docs/webhooks) 