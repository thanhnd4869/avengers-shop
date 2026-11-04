import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import useAuth from "@hooks/useAuth";
import { CartContext } from "@hooks/useCart";
import { ApiError } from "@services/apiClient";
import * as cartService from "@services/cartService";
import {
  capGuestCart,
  MAX_LINES,
  MAX_QUANTITY,
  onGuestCartChange,
  readGuestCart,
  writeGuestCart,
} from "@services/guestCart";

const EMPTY_CART = Object.freeze({
  items: [],
  removed: [],
  summary: { itemCount: 0, subtotal: 0, currency: "VND", canCheckout: false },
});

export const CART_NOTICES = Object.freeze({
  removed: "Some games in your cart are no longer sold and were removed.",
  merged: "The games you added before signing in are now in your cart.",
  adjusted: `Your cart was updated to our limits: up to ${MAX_QUANTITY} keys of each game and ${MAX_LINES} games per order.`,
});

function cartLimit(message) {
  return new ApiError(message, { status: 409, code: "CART_LIMIT" });
}

/** Why no more of a variant fits, worded as the API words it. */
function limitMessage(maxQuantity) {
  return maxQuantity >= MAX_QUANTITY
    ? `You can buy up to ${MAX_QUANTITY} keys of this game per order.`
    : `Only ${maxQuantity} ${maxQuantity === 1 ? "key is" : "keys are"} left for this game.`;
}

function toStoredItems(cart) {
  return cart.items.map(({ variantId, quantity }) => ({ variantId, quantity }));
}

/**
 * Keeps one cart for the whole app. A guest's lines live in the browser and
 * are priced by the API on every change; once signed in, the API stores the
 * cart and the guest lines are merged into it.
 *
 * Every read and write runs through one queue, so quick clicks apply in
 * order and a slow response can never overwrite a newer one. A queued step
 * whose shopper has since signed in or out is dropped.
 */
function CartProvider({ children }) {
  const { status: authStatus, user } = useAuth();
  const [cart, setCart] = useState(EMPTY_CART);
  const [status, setStatus] = useState("loading");
  const [isUpdating, setIsUpdating] = useState(false);
  const [notice, setNotice] = useState("");

  const owner = authStatus === "loading" ? null : (user?.id ?? "guest");
  const ownerRef = useRef(owner);
  const queue = useRef(Promise.resolve());
  const pending = useRef(0);
  const [shownOwner, setShownOwner] = useState(owner);
  const isGuest = owner === "guest";

  // Signing in or out shows an empty, loading cart at once rather than the
  // previous shopper's lines until the new cart arrives.
  if (shownOwner !== owner) {
    setShownOwner(owner);
    setCart(EMPTY_CART);
    setStatus("loading");
  }

  // Updated before the effects below run `load`, so queued steps see who the
  // shopper is now.
  useLayoutEffect(() => {
    ownerRef.current = owner;
  }, [owner]);

  const enqueue = useCallback((task, { quiet = false } = {}) => {
    const runFor = ownerRef.current;

    if (!quiet) {
      pending.current += 1;
      setIsUpdating(true);
    }

    const run = queue.current.then(async () => {
      if (ownerRef.current !== runFor) {
        throw new ApiError("Your session changed. Please try again.", { code: "STALE" });
      }

      const next = await task();

      // Signing in or out while the request was in flight: its answer
      // belongs to the previous shopper.
      if (ownerRef.current === runFor && next) {
        setCart(next);
        setStatus("ready");

        if (next.removed?.length) setNotice(CART_NOTICES.removed);
        else if (next.adjusted) setNotice(CART_NOTICES.adjusted);
      }

      return next;
    });

    queue.current = run.catch(() => {});

    return run.finally(() => {
      if (!quiet) {
        pending.current -= 1;
        if (pending.current === 0) setIsUpdating(false);
      }
    });
  }, []);

  /** Prices the guest lines, and forgets the ones the API no longer sells. */
  const priceGuestCart = useCallback(async (items) => {
    if (!items.length) {
      writeGuestCart([]);
      return EMPTY_CART;
    }

    const { data } = await cartService.previewCart(items);

    if (data.removed.length) writeGuestCart(toStoredItems(data));

    return data;
  }, []);

  const load = useCallback(
    (options) =>
      enqueue(async () => {
        // A cart saved under the earlier, higher limits is lowered first.
        const adjusted = capGuestCart();

        if (ownerRef.current === "guest") {
          const priced = await priceGuestCart(readGuestCart());

          return adjusted ? { ...priced, adjusted } : priced;
        }

        const guestItems = readGuestCart();

        if (!guestItems.length) {
          return (await cartService.getCart()).data;
        }

        // Kept until the merge succeeds, so a failed one is retried later.
        const { data } = await cartService.mergeCart(guestItems);

        writeGuestCart([]);
        setNotice(CART_NOTICES.merged);

        return data;
      }, options).catch((error) => {
        if (error.code !== "STALE" && ownerRef.current !== null) setStatus("error");
      }),
    [enqueue, priceGuestCart],
  );

  // Signing in merges the guest cart; signing out shows the (now empty)
  // guest cart.
  useEffect(() => {
    if (owner !== null) load();
  }, [owner, load]);

  // Another tab may have changed the cart: guests hear it through storage,
  // signed-in shoppers get a fresh copy whenever they come back to this tab.
  useEffect(() => {
    if (owner === null) return undefined;

    if (owner === "guest") {
      return onGuestCartChange(() => load({ quiet: true }));
    }

    const refresh = () => {
      if (document.visibilityState === "visible") load({ quiet: true });
    };

    document.addEventListener("visibilitychange", refresh);

    return () => document.removeEventListener("visibilitychange", refresh);
  }, [owner, load]);

  const addItem = useCallback(
    (variantId, quantity = 1) =>
      enqueue(async () => {
        if (ownerRef.current !== "guest") {
          return (await cartService.addCartItem({ variantId, quantity })).data;
        }

        // The same checks the API makes for a stored cart, using the
        // catalogue's current stock from a preview.
        const items = readGuestCart();
        const existing = items.find((item) => item.variantId === variantId);

        if (!existing && items.length >= MAX_LINES) {
          throw cartLimit(`A cart holds at most ${MAX_LINES} different games.`);
        }

        const wanted = Math.min((existing?.quantity ?? 0) + quantity, MAX_QUANTITY);
        const next = existing
          ? items.map((item) => (item === existing ? { ...item, quantity: wanted } : item))
          : [...items, { variantId, quantity: wanted }];
        const { data } = await cartService.previewCart(next);
        const line = data.items.find((item) => item.variantId === variantId);

        if (!line) {
          throw new ApiError("This game is no longer sold.", { status: 404, code: "NOT_FOUND" });
        }

        if (line.maxQuantity === 0) {
          throw new ApiError("This game is sold out on this platform.", {
            status: 409,
            code: "OUT_OF_STOCK",
          });
        }

        if (existing && existing.quantity >= line.maxQuantity) {
          throw cartLimit(limitMessage(line.maxQuantity));
        }

        if (wanted > line.maxQuantity) {
          const clamped = next.map((item) =>
            item.variantId === variantId ? { ...item, quantity: line.maxQuantity } : item,
          );

          writeGuestCart(clamped);
          return priceGuestCart(clamped);
        }

        writeGuestCart(toStoredItems(data));
        return data;
      }),
    [enqueue, priceGuestCart],
  );

  const setQuantity = useCallback(
    (variantId, quantity) =>
      enqueue(async () => {
        if (ownerRef.current !== "guest") {
          return (await cartService.setCartItemQuantity(variantId, quantity)).data;
        }

        const items = readGuestCart();
        const { data } = await cartService.previewCart(items);
        const line = data.items.find((item) => item.variantId === variantId);

        if (line && quantity > line.maxQuantity) {
          throw cartLimit(
            line.maxQuantity === 0
              ? "This game is sold out on this platform."
              : limitMessage(line.maxQuantity),
          );
        }

        const next = items.map((item) =>
          item.variantId === variantId ? { ...item, quantity } : item,
        );

        writeGuestCart(next);
        return priceGuestCart(next);
      }),
    [enqueue, priceGuestCart],
  );

  const removeItem = useCallback(
    (variantId) =>
      enqueue(async () => {
        if (ownerRef.current !== "guest") {
          return (await cartService.removeCartItem(variantId)).data;
        }

        const next = readGuestCart().filter((item) => item.variantId !== variantId);

        writeGuestCart(next);
        return priceGuestCart(next);
      }),
    [enqueue, priceGuestCart],
  );

  const clear = useCallback(
    () =>
      enqueue(async () => {
        if (ownerRef.current !== "guest") {
          return (await cartService.clearCart()).data;
        }

        writeGuestCart([]);
        return EMPTY_CART;
      }),
    [enqueue],
  );

  const value = useMemo(
    () => ({
      cart,
      status,
      isGuest,
      isUpdating,
      itemCount: cart.summary.itemCount,
      notice,
      clearNotice: () => setNotice(""),
      reload: () => load(),
      addItem,
      setQuantity,
      removeItem,
      clear,
    }),
    [cart, status, isGuest, isUpdating, notice, load, addItem, setQuantity, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export default CartProvider;
