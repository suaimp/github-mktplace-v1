import { useState, useImperativeHandle, forwardRef } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { supabase } from "../../lib/supabase";
import { sanitizeStripeError } from "../../utils/errorSanitizer";

interface StripePaymentFormProps {
  amount: number;
  currency: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
}

export interface StripePaymentFormRef {
  submitPayment: () => Promise<void>;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Outfit", sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4"
      }
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a"
    }
  },
  hidePostalCode: true
};

export default forwardRef<StripePaymentFormRef, StripePaymentFormProps>(
  function StripePaymentForm({ amount, currency, onSuccess, onError }, ref) {
    const stripe = useStripe();
    const elements = useElements();

    const [cardError, setCardError] = useState<string | null>(null);

    const submitPayment = async () => {
      if (!stripe || !elements) {
        console.log("STRIPE ERROR - Stripe or Elements not loaded:", {
          stripeLoaded: !!stripe,
          elementsLoaded: !!elements,
          timestamp: new Date().toISOString()
        });
        onError("Stripe não foi carregado corretamente");
        return;
      }

      setCardError(null);

      try {
        // Get the current session
        const {
          data: { session }
        } = await supabase.auth.getSession();

        if (!session) {
          throw new Error("No authenticated session found");
        }

        // Create a payment intent using the Supabase Edge Function
        const response = await fetch(
          `${
            import.meta.env.VITE_SUPABASE_URL
          }/functions/v1/create-payment-intent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              amount,
              currency
            })
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Payment intent error response:", errorData);
          console.log("PAYMENT INTENT CREATION ERROR:", {
            errorMessage: errorData.details || errorData.error,
            errorData: errorData,
            paymentMethod: "card",
            timestamp: new Date().toISOString(),
            amount: amount,
            currency: currency,
            responseStatus: response.status,
            responseStatusText: response.statusText
          });
          // Sanitize the error message from the API response
          const rawMessage =
            errorData.details ||
            errorData.error ||
            "Failed to create payment intent";
          const sanitizedMessage = sanitizeStripeError(rawMessage);
          throw new Error(sanitizedMessage);
        }

        const { clientSecret } = await response.json();

        // Confirm the payment with the card element
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error("Card element not found");
        }

        const { error, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                // You can add billing details here if needed
              }
            }
          }
        );
        if (error) {
          console.error("Stripe error:", error);
          console.log("STRIPE PAYMENT ERROR:", {
            errorMessage: error.message,
            errorType: error.type,
            errorCode: error.code,
            errorDeclineCode: error.decline_code,
            paymentMethod: "card",
            timestamp: new Date().toISOString(),
            amount: amount,
            currency: currency,
            stripeErrorDetails: error
          });
          // Sanitize the error message before throwing
          const sanitizedMessage = sanitizeStripeError(error);
          throw new Error(sanitizedMessage);
        }

        if (paymentIntent.status === "succeeded") {
          onSuccess(paymentIntent.id);
        } else {
          throw new Error(`Payment status: ${paymentIntent.status}`);
        }
      } catch (error: any) {
        console.error("Payment error:", error);
        console.log("STRIPE PAYMENT PROCESSING ERROR:", {
          errorMessage: error.message,
          errorStack: error.stack,
          paymentMethod: "card",
          timestamp: new Date().toISOString(),
          amount: amount,
          currency: currency,
          stripeInitialized: !!stripe,
          elementsInitialized: !!elements,
          cardElementFound: !!elements?.getElement(CardElement)
        });
        // Sanitize the error message before displaying
        const sanitizedMessage = sanitizeStripeError(error);
        setCardError(sanitizedMessage);
        onError(sanitizedMessage);
      }
    };

    useImperativeHandle(ref, () => ({
      submitPayment
    }));

    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
      await submitPayment();
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>

        {cardError && (
          <div className="p-3 text-sm text-error-600 bg-error-50 rounded-lg dark:bg-error-500/15 dark:text-error-500">
            {cardError}
          </div>
        )}

        {/* Payment button removed from here */}
      </form>
    );
  }
);
