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
  const { data, error } = await supabase.functions.invoke("payment-sheet", {
    body: { amount },
  });

  if (data) {
    console.log("Payment sheet params: ", data);
    //this would return {"paymentIntent": "...", "publishableKey": "..."}
    return data;
  }
  Alert.alert(`Error Fetch: ${error?.message ?? "no data"}`);
  return {};
};

export const initializePaymentSheet = async (amount: number) => {
  console.log("Initializing payment sheet for: ", amount);
  // setLoading(true);
  const { paymentIntent, publishableKey, customer, ephemeralKey } =
    await fetchPaymentSheetParams(amount);
  /* publishableKey is for communication between Stripe and our server
  paymentIntent.client_secret is for finding and finishing the specific deal in Stripe server*/

  if (!publishableKey || !paymentIntent) return;

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
    Alert.alert(`Error openPaymentSheet code: ${error.code}`, error.message);
    return false;
  }
  Alert.alert("Success", "Your order is confirmed!");
  return true;
};
