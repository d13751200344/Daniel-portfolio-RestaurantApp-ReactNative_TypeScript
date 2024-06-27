import { createContext, useContext, PropsWithChildren, useState } from "react";
import { CartItem, Tables } from "@/types";
import { randomUUID } from "expo-crypto";
import { useInsertOrder } from "@/api/orders";
import { useRouter } from "expo-router";
import { useInsertOrderItems } from "@/api/order-items";
import { initializePaymentSheet, openPaymentSheet } from "@/lib/stripe";

type Product = Tables<"products">;

// check "/src/types.tsx"
type CartType = {
  items: CartItem[];
  addItem: (product: Product, size: CartItem["size"]) => void;
  updateQuantity: (itemId: string, amount: -1 | 1) => void;
  total: number;
  checkout: () => void;
};

const CartContext = createContext<CartType>({
  /* initial value, and it will be overwritten by the value we pass to the provider */
  items: [],
  addItem: () => {},
  updateQuantity: () => {},
  total: 0,
  checkout: () => {},
});

const CartProvider = ({ children }: PropsWithChildren) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // get mutate functions from hooks and rename them
  const { mutate: insertOrder } = useInsertOrder();
  const { mutate: insertOrderItems } = useInsertOrderItems();

  const router = useRouter();

  // update quantity of an item in the cart
  const updateQuantity = (itemId: string, amount: -1 | 1) => {
    const updatedItems = items
      .map((item) => {
        /* if the item is the one we want to update, keep the item as it is, but update the quantity */
        return item.id !== itemId
          ? item
          : { ...item, quantity: item.quantity + amount };
      })
      .filter((item) => item.quantity > 0); // filter out items with quantity 0
    setItems(updatedItems);
  };

  const addItem = (product: Product, size: CartItem["size"]) => {
    // check if the item with the same size already exists in the cart
    const existingItem = items.find(
      (item) => item.product === product && item.size === size
    );

    if (existingItem) {
      updateQuantity(existingItem.id, 1);
      return;
    }

    const newCartItem: CartItem = {
      id: randomUUID(),
      product,
      product_id: product.id,
      size,
      quantity: 1,
    };

    setItems([newCartItem, ...items]);
  };

  // sum up the total price of all items in the cart; 0 is the initial value
  const total = items.reduce(
    (sum, item) => (sum += item.product.price * item.quantity),
    0
  );

  const clearCart = () => {
    setItems([]);
  };

  const checkout = async () => {
    try {
      await initializePaymentSheet(Math.floor(total * 100));
      const payed = await openPaymentSheet();
      if (!payed) {
        return;
      }

      insertOrder(
        { total },
        {
          onSuccess: saveOrderItems,
        }
      );
    } catch (error) {
      console.error("Checkout error:", error);
      // Handle error accordingly
    }
  };

  const saveOrderItems = (order: Tables<"orders">) => {
    // create a parameter "order" object and it's type is Tables<"orders">
    const orderItems = items.map((cartItem) => ({
      // use `()` to wrap the returned objects so that JS can identify it correctly
      order_id: order.id,
      product_id: cartItem.product_id,
      size: cartItem.size,
      quantity: cartItem.quantity,
    }));

    insertOrderItems(orderItems, {
      onSuccess: () => {
        clearCart();
        router.replace(`/(user)/orders/${order.id}`);
      },
    });
  };

  return (
    /* CartContext.Provider is a wrapper component that provides the value to all its children; 
    items is equivalent to items: items below */
    <CartContext.Provider
      value={{ items, addItem, updateQuantity, total, checkout }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;

export const useCart = () => useContext(CartContext);
