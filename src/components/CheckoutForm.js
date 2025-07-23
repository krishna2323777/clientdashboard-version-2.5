import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { supabase } from './SupabaseClient';
import './Payment.css';

const CheckoutForm = ({ clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(null);

  // Extract payment information from client secret
  useEffect(() => {
    if (clientSecret) {
      const fetchPaymentDetails = async () => {
        try {
          const { data, error } = await supabase
            .from('payments')
            .select('amount, currency')
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (data && data.length > 0) {
            setPaymentAmount(data[0]);
          }
        } catch (err) {
          console.error('Error fetching payment details:', err);
        }
      };
      
      fetchPaymentDetails();
    }
  }, [clientSecret]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      }
    );

    if (stripeError) {
      setError(`Payment failed: ${stripeError.message}`);
      setProcessing(false);
    } else {
      // Capture payment method details for display
      setPaymentMethod({
        brand: paymentIntent.payment_method_details?.card?.brand || 'card',
        last4: paymentIntent.payment_method_details?.card?.last4 || '****'
      });
      
      setSucceeded(true);
      setProcessing(false);
      
      // Payment succeeded, but we'll let the webhook update the database
      console.log('Payment succeeded, awaiting webhook to update status');
    }
  };

  const formatCurrency = (amount, currency = 'eur') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="payment-form-container">
        <h2>Complete Your Payment</h2>
        
        {paymentAmount && (
          <div className="payment-amount">
            <h3>Amount: {formatCurrency(paymentAmount.amount, paymentAmount.currency)}</h3>
          </div>
        )}
        
        <div className="card-element-container">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
        {error && <div className="payment-error">{error}</div>}
        {succeeded ? (
          <div className="payment-success">
            <h3>Payment Successful!</h3>
            {paymentMethod && (
              <p>Payment completed with {paymentMethod.brand} ending in {paymentMethod.last4}</p>
            )}
            <p>Your payment has been processed successfully.</p>
            <p>You will receive a confirmation email shortly.</p>
            <button 
              className="close-button"
              onClick={() => window.close()}
            >
              Close
            </button>
          </div>
        ) : (
          <button
            type="submit"
            disabled={!stripe || processing}
            className="pay-button"
          >
            {processing ? 'Processing...' : 'Pay Now'}
          </button>
        )}
      </div>
    </form>
  );
};

export default CheckoutForm; 
