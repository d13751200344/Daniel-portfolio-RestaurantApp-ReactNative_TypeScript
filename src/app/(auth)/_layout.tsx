import { Stack, Redirect } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";

export default function AuthLayout() {
  const { session } = useAuth();

  if (session) {
    // redirect to home if user is authenticated, and the user will be redirected to somewhere from "/".
    return <Redirect href="/" />;
  }

  return <Stack />;
}
