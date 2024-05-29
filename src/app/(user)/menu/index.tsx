import { View, FlatList, ActivityIndicator, Text } from "react-native";
import ProductListItem from "@components/ProductListItem";
import { useProductList } from "@/api/products/index";

export default function MenuScreen() {
  const { data: products, error, isLoading } = useProductList();

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (error) {
    return <Text>Failed to fetch products</Text>;
  }

  return (
    <View>
      <FlatList
        data={products}
        renderItem={({ item }) => <ProductListItem product={item} />}
        /* item is every product in the array products */
        numColumns={2} /* make a grid so that we have two columns */
        contentContainerStyle={{
          gap: 10,
          padding: 10,
        }} /* gap: between rows; padding: the whole FlatList */
        columnWrapperStyle={{ gap: 10 }} /* gap between columns */
      />
    </View>
  );
}