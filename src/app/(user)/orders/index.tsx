import { FlatList, ActivityIndicator, Text } from "react-native";
import OrderListItem from "@components/OrderListItem";
import { Stack } from "expo-router";
import { supabase } from "@/lib/supabase";
import Button from "@/components/Button";
import { useMyOrderList } from "@/api/orders";

export default function OrdersScreen() {
  const { data: orders, isLoading, error } = useMyOrderList();
  if (isLoading) {
    return <ActivityIndicator />;
  }
  if (error) {
    return <Text>Failed to fetch</Text>;
  }

  return (
    <>
      <Stack.Screen options={{ title: "Orders" }} />
      <FlatList
        data={orders}
        contentContainerStyle={{ gap: 10, padding: 10 }}
        renderItem={({ item }) => <OrderListItem order={item} />}
      />
      <Button text="Sign Out" onPress={() => supabase.auth.signOut()} />
    </>
  );
}
