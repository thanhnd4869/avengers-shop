import { createContext, useContext } from "react";

export const CartContext = createContext(null);

/**
 * The shopper's cart, whether a guest's (kept in the browser) or a signed-in
 * account's (kept by the API), and the actions that change it.
 */
function useCart() {
  const cart = useContext(CartContext);

  if (!cart) {
    throw new Error("useCart must be used inside <CartProvider>");
  }

  return cart;
}

export default useCart;
