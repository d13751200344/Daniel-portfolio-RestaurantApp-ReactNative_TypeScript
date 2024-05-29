import React from "react";
import { Stack, useLocalSearchParams, router, Link } from "expo-router";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
//import products from "@assets/data/products"; // dummy data source
import { defaultPizzaImage } from "@/components/ProductListItem";
import { useState } from "react";
import Button from "@/components/Button";
import { PizzaSize } from "@/types";
import { useCart } from "@/providers/CartProvider";
import { FontAwesome } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { useProduct } from "@/api/products";

const sizes: PizzaSize[] = ["S", "M", "L", "XL"];

const ProductDetailsScreen = () => {
  const { id: idString } = useLocalSearchParams();
  // id was string or array, so we need to convert it to number
  const id = parseFloat(typeof idString === "string" ? idString : idString[0]);

  const { data: product, error, isLoading } = useProduct(id);

  // imported from "@/providers/CartProvider";
  const { addItem } = useCart();

  // default to medium size
  const [selectedSize, setSelectedSize] = useState<PizzaSize>("M");

  //const product = products.find((p) => p.id.toString() === id); // dummy data source

  const addToCart = () => {
    if (!product) return;
    addItem(product, selectedSize);
    router.push("/cart"); //navigate to cart screen automatically
  };

  /* dummy data source
  if (!product) {
    return <Text>Product not found</Text>;
  }
  */

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (error) {
    return <Text>Failed to fetch products</Text>;
  }

  return (
    <View>
      <Stack.Screen
        options={{
          title: "Menu",
          headerRight: () => (
            <Link href={`/(admin)/menu/create?id=${id}`} asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="pencil"
                    size={25}
                    color={Colors.light.tint}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />

      <Stack.Screen options={{ title: product.name }} />
      <Image
        source={{ uri: product.image || defaultPizzaImage }}
        style={styles.image}
      />

      <Text style={styles.title}>{product.name}</Text>
      <Text style={styles.price}>${product.price}</Text>
    </View>
  );
};

export default ProductDetailsScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
    padding: 10,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    alignSelf: "center",
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
