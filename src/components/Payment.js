import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import { supabase } from './SupabaseClient';
import './Payment.css';
import { useNavigate} from 'react-router-dom';


const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

// Card entry component with multi-step flow
const CardEntryForm = ({ clientSecret, amount, currency = "EUR", invoiceNumber }) => {
  const stripe = useStripe();
  const navigate = useNavigate();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState(null);
    const handleCancel = () => {
    navigate('/settings?section=billing');
  };


  useEffect(() => {
    if (!stripe) return;

    // Check if we have a payment status in the URL
    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) return;

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      return;
    }

    setIsProcessing(true);
    setMessage(null); // Clear any previous messages

    try {
      // Get all card elements
      const cardNumberElement = elements.getElement(CardNumberElement);
      const cardExpiryElement = elements.getElement(CardExpiryElement);
      const cardCvcElement = elements.getElement(CardCvcElement);
      
      // Make sure all card details are filled in
      if (!cardNumberElement || !cardExpiryElement || !cardCvcElement) {
        setMessage('Please fill in all card details');
        setIsProcessing(false);
        return;
      }

      // Process the payment with the card number element (which automatically associates with the other elements)
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            // You can add billing details here if needed
          }
        }
      });

      if (error) {
        console.log('Payment error:', error);
        
        // Handle specific card errors
        if (error.type === 'card_error') {
          if (error.code === 'incorrect_cvc') {
            setMessage('The card security code (CVV) is incorrect. Please try again.');
          } else if (error.code === 'card_declined') {
            setMessage('Your card was declined. Please try another payment method.');
          } else if (error.code === 'expired_card') {
            setMessage('Your card has expired. Please try another card.');
          } else {
            setMessage(error.message || 'There was an issue with your card. Please try again.');
          }
        } 
        // Handle authentication errors - typically for 3D Secure
        else if (error.type === 'validation_error') {
          setMessage('Additional authentication is required. Please continue with the verification process.');
        } 
        // Handle other errors
        else {
          setMessage(error.message || 'An error occurred processing your payment.');
        }
      } 
      // Handle payment intent status
      else if (paymentIntent) {
        // Check for different payment intent statuses
        switch (paymentIntent.status) {
          case 'succeeded':
            // Payment successful - update database
            try {
              // Extract the payment intent ID from the client secret
              const paymentIntentId = clientSecret.split('_secret_')[0];
              
              if (paymentIntentId) {
                // Update the payment record in the database
                const { error: updateError } = await supabase
                  .from('payments')
                  .update({ status: 'succeeded' })
                  .eq('stripe_payment_id', paymentIntentId);
                  
                if (updateError) {
                  console.error('Error updating payment status:', updateError);
                }
                
                // If we have an invoice number, update the invoice as well
                if (invoiceNumber) {
                  const { error: invoiceError } = await supabase
                    .from('invoices')
                    .update({ payment_status: true })
                    .eq('invoice_number', invoiceNumber);
                    
                  if (invoiceError) {
                    console.error('Error updating invoice status:', invoiceError);
                  }
                }
              }
            } catch (dbError) {
              console.error('Error updating database:', dbError);
            }
            
            setMessage('Payment succeeded! You will be redirected to your invoices in a moment.');
            setTimeout(() => {
              window.location.href = '/settings?section=billing';
            }, 3000);
            break;
            
          case 'requires_action':
          case 'requires_confirmation':
            // This typically means 3D Secure authentication is required
            setMessage('Additional authentication is required. Please complete the verification process.');
            // The Stripe.js SDK should automatically handle the next steps for 3D Secure
            break;
            
          case 'processing':
            setMessage('Your payment is processing. We\'ll update you when payment is received.');
            break;
            
          default:
            setMessage(`Payment status: ${paymentIntent.status}. Please contact support if you need assistance.`);
        }
      }
    } catch (stripeError) {
      console.error('Error processing payment:', stripeError);
      // Display the actual error if available, otherwise show a generic message
      setMessage(stripeError.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
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
  };

  return (
    <div className="payment-form">
      <div className="payment-header">
        <h2>Complete Your Payment</h2>
        <div className="payment-amount">
          <p>Amount: {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount)}</p>
        </div>
        {invoiceNumber && (
          <div className="payment-invoice">
            <p>Invoice: #{invoiceNumber}</p>
          </div>
        )}
      </div>

      <form id="payment-form" className="card-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="card-number-element">Card Number</label>
          <div id="card-number-element" className="form-control">
            <CardNumberElement options={cardElementOptions} />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group half-width">
            <label htmlFor="card-expiry-element">Expiration Date</label>
            <div id="card-expiry-element" className="form-control">
              <CardExpiryElement options={cardElementOptions} />
            </div>
          </div>
          
          <div className="form-group half-width">
            <label htmlFor="card-cvc-element">Security Code (CVV)</label>
            <div id="card-cvc-element" className="form-control">
              <CardCvcElement options={cardElementOptions} />
            </div>
          </div>
        </div>
        
      

          <div className="button-group">
          <button 
            type="submit"
            className="btn btn-primary" 
            disabled={isProcessing || !stripe || !elements} 
            id="submit"
          >
            {isProcessing ? "Processing..." : "Pay Now"}
          </button>
          <button 
            type="button"
            className="btn btn-secondary" 
            onClick={handleCancel}
            disabled={isProcessing}
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Show any error or success messages */}
      {message && <div className={`payment-message ${message.includes('succeeded') ? 'success' : message.includes('processing') ? 'info' : 'error'}`}>{message}</div>}
    </div>
  );
};

const Payment = () => {
  const [searchParams] = useSearchParams();
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getPaymentDetails() {
      try {
        // Get the payment_intent from URL params
        const clientSecret = searchParams.get('payment_intent');
        
        if (!clientSecret) {
          setError('No payment intent found in URL');
          setLoading(false);
          return;
        }

        // Extract the payment intent ID from the client secret
        // Format is typically: pi_XXXXXXXXXXXX_secret_XXXXXXXX
        const paymentIntentId = clientSecret.split('_secret_')[0];
        
        if (!paymentIntentId) {
          console.error('Could not extract payment intent ID');
          setError('Invalid payment intent format');
          setLoading(false);
          return;
        }

        // Find the payment in payments table using the payment intent ID
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .select('invoice_number, amount, currency')
          .eq('stripe_payment_id', paymentIntentId)
          .single();

        if (paymentError) {
          console.error('Error fetching payment:', paymentError);
          
          // If payment not found, try to get details directly from the invoice
          console.log('Attempting to fetch invoice directly...');
          
          // Fetch the invoice data from Supabase
          // This assumes you have some way to link payments to invoices
          const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .select('total, currency, invoice_number')
            .limit(1)
            .single();

          if (invoiceError) {
            console.error('Error fetching invoice:', invoiceError);
            setError('Could not fetch payment details');
            setLoading(false);
            return;
          }

          if (!invoice) {
            setError('Payment details not found');
            setLoading(false);
            return;
          }

          setInvoiceData(invoice);
          
          // Set payment intent with the actual invoice amount
          setPaymentIntent({
            clientSecret,
            amount: invoice.total,
            currency: invoice.currency || 'EUR',
            invoiceNumber: invoice.invoice_number
          });
        } else {
          // Payment found, now fetch the corresponding invoice
          if (payment.invoice_number) {
            const { data: invoice, error: invoiceError } = await supabase
              .from('invoices')
              .select('total, currency')
              .eq('invoice_number', payment.invoice_number)
              .single();

            if (invoiceError) {
              console.error('Error fetching invoice:', invoiceError);
              // If we can't get the invoice, use the payment data
              setPaymentIntent({
                clientSecret,
                amount: payment.amount,
                currency: payment.currency || 'EUR',
                invoiceNumber: payment.invoice_number
              });
            } else {
              // We have both payment and invoice data
              setInvoiceData(invoice);
              setPaymentIntent({
                clientSecret,
                amount: invoice.total,
                currency: invoice.currency || 'EUR',
                invoiceNumber: payment.invoice_number
              });
            }
          } else {
            // No invoice number in payment, use payment data only
            setPaymentIntent({
              clientSecret,
              amount: payment.amount,
              currency: payment.currency || 'EUR'
            });
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error in getPaymentDetails:', err);
        setError('Error loading payment information');
        setLoading(false);
      }
    }
    
    getPaymentDetails();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="payment-container">
        <div className="loading">Loading payment information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-container">
        <div className="payment-error">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const options = {
    clientSecret: paymentIntent.clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#4CAF50',
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#df1b41',
        fontFamily: 'Arial, sans-serif',
        spacingUnit: '4px',
        borderRadius: '4px',
      },
    }
  };

  return (
    <div className="payment-container">
      {paymentIntent && (
        <Elements options={options} stripe={stripePromise}>
          <CardEntryForm 
            clientSecret={paymentIntent.clientSecret} 
            amount={paymentIntent.amount}
            currency={paymentIntent.currency}
            invoiceNumber={paymentIntent.invoiceNumber}
          />
        </Elements>
      )}
    </div>
  );
};

export default Payment; 
