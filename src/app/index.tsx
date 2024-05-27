import { View, Text, ActivityIndicator } from "react-native";
import React from "react";
import Button from "../components/Button";
import { Link, Redirect } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";

const index = () => {
  const { session, loading } = useAuth();

  if (loading) {
    // show a spin icon to indicate it's loading
    return <ActivityIndicator />;
  }

  if (!session) {
    // if the user isn't signed-in, redirect to sign-in page
    return <Redirect href="/sign-in" />;
  }

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
