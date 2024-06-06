import { StyleSheet, Image, Text, View, Pressable } from "react-native";
import Colors from "../constants/Colors";
import { Tables } from "../types";
import { Link, useSegments } from "expo-router";
import RemoteImage from "./RemoteImage";

export const defaultPizzaImage =
  "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/food/default.png";

type ProductListItemProps = {
  product: Tables<"products">;
};

/* {product} is a prop that we pass to this component as well as what we destructure from 
the ProductListItemProps */
const ProductListItem = ({ product }: ProductListItemProps) => {
  const segments = useSegments();
  //console.log(segments);  //["(admin)", "menu", "id"] or ["(user)", "menu", "id"]

  return (
    // asChild: to make sure the link is rendered as this view with its styles
    <Link href={`/${segments[0]}/menu/${product.id}`} asChild>
      <Pressable style={styles.container}>
        <RemoteImage
          //source={{ uri: product.image || defaultPizzaImage }}
          path={product.image}
          fallback={defaultPizzaImage}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
      </Pressable>
    </Link>
  );
};

export default ProductListItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 10,
    flex: 1,
    maxWidth:
      "50%" /* if we have 3 items, we want to have 2 items in a row, even if we only have 1 item in the last row */,
  },
  image: {
    width: "100%",
    aspectRatio: 1, // auto calculate height
    alignSelf: "center",
  },
  title: {
    fontWeight: "600",
    fontSize: 18,
    marginVertical: 10,
  },
  price: {
    color: Colors.light.tint,
    fontWeight: "bold",
    marginTop: "auto",
  },
});
