import { FlatList, ActivityIndicator, Text } from "react-native";
import OrderListItem from "@components/OrderListItem";
import { useAdminOrderList } from "@/api/orders";
import { useInsertOrderSubscription } from "@/api/orders/subscription";

export default function OrdersScreen() {
  //query order
  const {
    data: orders,
    isLoading,
    error,
  } = useAdminOrderList({ archived: false });

  // subscribe to changes in order list
  useInsertOrderSubscription();

  //query order
  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (error) {
    return <Text>Failed to fetch</Text>;
  }

  return (
    <FlatList
      data={orders}
      contentContainerStyle={{ gap: 10, padding: 10 }}
      renderItem={({ item }) => <OrderListItem order={item} />}
    />
  );
}
