import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import Button from "@/components/Button";
import { defaultPizzaImage } from "@/components/ProductListItem";
import Colors from "@/constants/Colors";
import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  useInsertProduct,
  useUpdateProduct,
  useProduct,
  useDeleteProduct,
} from "@/api/products";
import * as FileSystem from "expo-file-system";
import { randomUUID } from "expo-crypto";
import { supabase } from "@/lib/supabase";
import { decode } from "base64-arraybuffer";

const CreateProductScreen = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(""); // We will convert this to a number later
  const [errors, setErrors] = useState("");
  const [image, setImage] = useState<string | null>(null); // for image picker
  const [loading, setLoading] = useState(false);

  const { id: idString } = useLocalSearchParams();
  const id = parseFloat(
    typeof idString === "string" ? idString : idString?.[0]
  );
  const isUpdating = !!idString; // when "idString" exists, "isUpdating" will be true
  /* If id is null, undefined, 0, NaN, '' (an empty string), or false, !!id will be false; 
  For any other value (e.g., a non-empty string, a non-zero number), !!id will be true. */

  // mutate is a function that will trigger the mutation (useMutation() in index.ts)
  const { mutate: insertProduct } = useInsertProduct();
  const { mutate: updateProduct } = useUpdateProduct();
  const { data: updatingProduct } = useProduct(id);
  const { mutate: deleteProduct } = useDeleteProduct();

  const router = useRouter();

  /* Once we fetch the data, we will populate the fields with the data stored in the database */
  useEffect(() => {
    if (updatingProduct) {
      setName(updatingProduct.name);
      setPrice(updatingProduct.price.toString()); //as it's a number in the database
      setImage(updatingProduct.image);
    }
  }, [updatingProduct]);

  const resetFields = () => {
    setName("");
    setPrice("");
  };

  const validateInput = () => {
    setErrors(""); // Clear any previous errors
    if (!name) {
      setErrors("Name is required");
      return false;
    }

    if (!price) {
      setErrors("Price is required");
      return false;
    }

    if (isNaN(parseFloat(price))) {
      setErrors("Price must be a number");
      return false;
    }
    return true;
  };

  const onSubmit = () => {
    if (isUpdating) {
      // Update the product
      onUpdate();
    } else {
      onCreate();
    }
  };

  // supabase upload function
  const uploadImage = async () => {
    if (!image?.startsWith("file://")) {
      return;
    }

    const base64 = await FileSystem.readAsStringAsync(image, {
      encoding: "base64",
    });
    const filePath = `${randomUUID()}.png`;
    const contentType = "image/png";
    const { data, error } = await supabase.storage
      .from("product-images") // the bucket name
      .upload(filePath, decode(base64), { contentType });

    if (data) {
      return data.path;
    }
  };

  const onCreate = async () => {
    if (!validateInput()) {
      return;
    }

    setLoading(true); // Show loading indicator

    const imagePath = await uploadImage();

    insertProduct(
      { name, price: parseFloat(price), image: imagePath },
      {
        onSuccess: () => {
          setLoading(false); // Hide loading indicator
          resetFields();
          router.back();
        },
        onError: (error) => {
          //personal fix
          setLoading(false); // Hide loading indicator
          setErrors(error.message);
        },
      }
    );
  };

  const onUpdate = async () => {
    if (!validateInput()) {
      return;
    }

    setLoading(true); // Show loading indicator

    const imagePath = await uploadImage();
    updateProduct(
      { id, name, price: parseFloat(price), image: imagePath },
      {
        onSuccess: () => {
          setLoading(false); // Hide loading indicator
          resetFields();
          router.back();
        },
        onError: (error) => {
          //personal fix
          setLoading(false); // Hide loading indicator
          setErrors(error.message);
        },
      }
    );
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const onDelete = () => {
    setLoading(true); // Show loading indicator
    deleteProduct(id, {
      onSuccess: () => {
        setLoading(false); // Hide loading indicator
        resetFields();
        router.replace("/(admin)");
      },
      onError: (error) => {
        //personal fix
        setLoading(false); // Hide loading indicator
        setErrors(error.message);
      },
    });
  };
  const confirmDelete = () => {
    Alert.alert("Confirm", "Are you sure you want to delete this product?", [
      { text: "Cancel" },
      { text: "Delete", onPress: onDelete, style: "destructive" },
    ]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{ title: isUpdating ? "Update Product" : "Create Product" }}
      />
      <Image
        source={{ uri: image || defaultPizzaImage }}
        style={styles.image}
      />
      <Text style={styles.textButton} onPress={pickImage}>
        Select Image
      </Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        placeholder="Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Price ($)</Text>
      <TextInput
        placeholder="9.99"
        style={styles.input}
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />

      <Text style={styles.error}>{errors}</Text>
      <Button
        onPress={onSubmit}
        text={isUpdating ? "Update" : "Create"}
        disabled={loading}
      />
      {isUpdating && (
        <Text onPress={confirmDelete} style={styles.textButton}>
          Delete
        </Text>
      )}
      {loading && <ActivityIndicator size="large" color={Colors.light.tint} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 10,
  },
  label: {
    color: "grey",
    fontSize: 16,
  },
  input: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 20,
  },
  error: {
    color: "red",
    fontSize: 16,
  },
  image: {
    width: "50%",
    aspectRatio: 1,
    alignSelf: "center",
  },
  textButton: {
    alignSelf: "center",
    fontWeight: "bold",
    color: Colors.light.tint,
    marginVertical: 10,
  },
});

export default CreateProductScreen;
