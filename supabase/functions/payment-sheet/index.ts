// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { stripe } from "../_utils/stripe.ts";
import { createOrRetrieveProfile } from "../_utils/supabase.ts";

console.log("Hello from Functions!");

serve(async (req: Request) => {
  try {
    const { amount } = await req.json();

    // create or retrieve customer profile in Supabase, get the id
    const customer = await createOrRetrieveProfile(req);

    // Create an ephermeralKey so that the Stripe SDK can fetch the customer's stored payment methods.
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer },
      { apiVersion: "2020-08-27" }
    );

    /* Create a PaymentIntent so that the SDK can charge the logged in customer.
   after being created, data will be stored in Stripe server, and we don't need it anymore*/
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // $10.99, it should be represent in a lowest unit (cent)
      currency: "usd",
      customer: customer, // so that we can track the customer in Stripe website
    });

    /* publishableKey is for communication between Stripe and our server
  paymentIntent.client_secret is for finding and finishing the specific deal in Stripe server */
    const res = {
      paymentIntent: paymentIntent.client_secret,
      publishableKey: Deno.env.get("EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
      customer: customer,
      ephemeralKey: ephemeralKey.secret, // so that customers can use their stored payment methods
    };

    return new Response(JSON.stringify(res), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify(error), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/payment-sheet' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"amount":1150}'

*/
