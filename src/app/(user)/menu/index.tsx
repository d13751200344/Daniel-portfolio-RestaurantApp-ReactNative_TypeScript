import { View, FlatList } from "react-native";
//import products from '../../../assets/data/products';
import products from "@assets/data/products";
//import ProductListItem from '../../components/ProductListItem';
import ProductListItem from "@components/ProductListItem";

export default function MenuScreen() {
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
