export const createStripePaymentIntent = async ({ invoice_number, total, customer_email, user_id }) => {
  try {
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: {
        invoice_number,
        amount: total,
        currency: 'eur',
        description: `Payment for invoice ${invoice_number}`,
        client_email: customer_email,
        metadata: {
          user_id,
          invoice_number
        }
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(error.message);
    }

    if (!data || !data.clientSecret) {
      throw new Error('No payment intent received from server');
    }

    return {
      clientSecret: data.clientSecret,
      paymentIntentId: data.paymentIntentId
    };
  } catch (err) {
    console.error('Error creating payment intent:', err);
    throw err;
  }
}; 