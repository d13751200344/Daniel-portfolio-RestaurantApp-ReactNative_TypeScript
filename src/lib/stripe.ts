import { Alert } from "react-native";
import { supabase } from "./supabase";
import {
  initPaymentSheet,
  presentPaymentSheet,
} from "@stripe/stripe-react-native";

// having Stripe to store the payment data with calling the edge function
const fetchPaymentSheetParams = async (amount: number) => {
  console.log("fetching payment sheet params for: ", amount);
  // Create payment session for our customer with the edge function to use paymentIntent
  try {
    // Call the edge function and send a HTTP POST request with the amount from frontend to backend
    const { data, error } = await supabase.functions.invoke("payment-sheet", {
      body: { amount },
    });

    if (error) {
      throw new Error(`Edge Function returned error: ${error.message}`);
    }

    if (data) {
      console.log("Payment sheet params: ", data);
      return data; // Return {"paymentIntent": "...", "publishableKey": "..."}
    }
  } catch (error) {
    console.error("Error fetching payment sheet params:", error.message);
    Alert.alert(`Error Fetch: ${error.message}`);
  }

  return {}; // Return empty object if something goes wrong
};

export const initializePaymentSheet = async (amount: number) => {
  console.log("Initializing payment sheet for: ", amount);
  // setLoading(true);
  const { paymentIntent, publishableKey, customer, ephemeralKey } =
    await fetchPaymentSheetParams(amount);
  /* publishableKey is for communication between Stripe and our server
  paymentIntent.client_secret is for finding and finishing the specific deal in Stripe server*/

  if (!publishableKey || !paymentIntent) {
    Alert.alert("Error", "Missing publishable key or payment intent");
    return;
  }

  const result = await initPaymentSheet({
    merchantDisplayName: "Example, Inc.",
    paymentIntentClientSecret: paymentIntent,
    customerId: customer,
    customerEphemeralKeySecret: ephemeralKey,
    defaultBillingDetails: {
      name: "Jane Doe",
    },
  });
  console.log(result);
};

export const openPaymentSheet = async () => {
  // display the payment sheet with the stripe built-in function
  const { error } = await presentPaymentSheet();

  if (error) {
    Alert.alert(`Error: ${error.code}`, error.message);
    return false;
  }
  Alert.alert("Success", "Your order is confirmed!");
  return true;
};
