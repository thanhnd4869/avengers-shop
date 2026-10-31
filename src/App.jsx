import { RouterProvider } from "react-router";

import AuthProvider from "@components/AuthProvider";
import CartProvider from "@components/CartProvider";
import { router } from "@routes";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
