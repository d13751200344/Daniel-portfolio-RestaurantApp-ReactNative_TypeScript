import { View, Text, StyleSheet, TextInput, Image, Alert } from "react-native";
import { useState, useEffect } from "react";
import Button from "@/components/Button";
import { defaultPizzaImage } from "@/components/ProductListItem";
import Colors from "@/constants/Colors";
import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams } from "expo-router";

const CreateProductScreen = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(""); // We will convert this to a number later
  const [errors, setErrors] = useState("");
  const [image, setImage] = useState<string | null>(null); // for image picker

  const { id } = useLocalSearchParams();
  const isUpdating =
    !!id; /* If id is null, undefined, 0, NaN, '' (an empty string), or false, !!id will be false; For any other value (e.g., a non-empty string, a non-zero number), !!id will be true. */

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
      onUpdateCreate();
    } else {
      onCreate();
    }
  };

  const onCreate = () => {
    if (!validateInput()) {
      return;
    }

    console.warn("create");
    resetFields();
  };

  const onUpdateCreate = () => {
    if (!validateInput()) {
      return;
    }

    console.warn("Updating product: ");
    resetFields();
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
    console.warn("delete");
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
      <Button onPress={onSubmit} text={isUpdating ? "Update" : "Create"} />
      {isUpdating && (
        <Text onPress={confirmDelete} style={styles.textButton}>
          Delete
        </Text>
      )}
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