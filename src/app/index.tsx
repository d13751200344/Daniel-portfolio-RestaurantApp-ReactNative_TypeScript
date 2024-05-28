import { View, Text, ActivityIndicator } from "react-native";
import React from "react";
import Button from "../components/Button";
import { Link, Redirect } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";

const index = () => {
  const { session, loading, isAdmin } = useAuth();

  if (loading) {
    // show a spin icon to indicate it's loading
    return <ActivityIndicator />;
  }

  //console.log("session: " + session + ", isAdmin: " + isAdmin);
  if (!session) {
    // if the user isn't signed-in, redirect to sign-in page
    return <Redirect href="/sign-in" />;
  }

  if (!isAdmin) {
    // if the user is an admin, redirect to admin page
    return <Redirect href="/(user)" />;
  }

  // if the user is an admin, show the admin page.
  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 10 }}>
      <Link href={"/(user)"} asChild>
        <Button text="User" />
      </Link>
      <Link href={"/(admin)"} asChild>
        <Button text="Admin" />
      </Link>

      <Button text="Sign Out" onPress={() => supabase.auth.signOut()} />
    </View>
  );
};

export default index;
