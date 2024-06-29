import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { stripe } from "./stripe.ts";

/* create or Retrieve client profile in Supabase 
We sent HTTP POST req with fetchPaymentSheetParams() that includes user's JWT in header and amount in body*/
export const createOrRetrieveProfile = async (req: Request) => {
  // create a Supabase client and put user's credentials in request headers so that we can connect and manage the database in Supabase
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        // create a client with the JWT token from the user request header
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    }
  );

  // Now we can retrieve user's data from Supabase with the SupabaseClient (JWT in request header)
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  //console.log(user);
  if (!user) throw new Error("No user found");

  // Based on the userId we got from req, retrieve the user's data row from the profiles table in Supabase
  const { data: profile, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  // if there is no relative data row in the profiles table, return error
  if (error || !profile) {
    throw new Error("Profile not found.");
  }

  console.log(profile);

  // if the user is already a Stripe customer ("stripe_customer_id" field is not null), return id
  if (profile.stripe_customer_id) {
    return profile.stripe_customer_id;
  }

  /* if the user is not a Stripe customer, which means the "stripe_customer_id" field in the data row in profiles table is null, we create a new customer in Stripe and store the id in "stripe_customer_id" field in the profiles table in Supabase */
  const customer = await stripe.customers.create({
    email: user.email,
    metadata: { uid: user.id },
  });
  //console.log(customer);
  await supabaseClient
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", profile.id);

  return customer.id;
};
