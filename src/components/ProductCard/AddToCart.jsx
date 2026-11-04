import { useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Overlay from "react-bootstrap/Overlay";
import Popover from "react-bootstrap/Popover";
import Spinner from "react-bootstrap/Spinner";

import Icon from "@components/Icon";
import useCart from "@hooks/useCart";
import { getProduct } from "@services/productService";
import { formatMoney } from "@utils/format";

// How long the button says "Added" before it reads "Add to cart" again.
const ADDED_MS = 1500;

function variantLabel(variant, showEdition) {
  return showEdition ? `${variant.platform.name} · ${variant.edition}` : variant.platform.name;
}

/**
 * The card's "Add to cart" button. It keeps its size throughout: while a key
 * is being added a spinner takes the place of its icon, and once added it
 * reads "✓ Added" for a moment before going back to "Add to cart".
 *
 * A game sold as one variant goes straight into the cart. One sold on several
 * platforms or editions opens a small menu under the button to pick which,
 * loaded fresh each time so its stock is current. Problems (sold out, cart
 * limits) show in the same menu instead of an alert.
 */
function AddToCart({ product, className = "" }) {
  const { id, name, slug, hasVariants, variantId, inStock } = product;
  const { addItem } = useCart();
  const buttonRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [variants, setVariants] = useState(null);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [adding, setAdding] = useState(null);
  const [error, setError] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [added, setAdded] = useState(false);
  const addedTimer = useRef();
  const canQuickAdd = !hasVariants && Boolean(variantId);
  const popoverId = `add-to-cart-${id}`;

  useEffect(() => () => clearTimeout(addedTimer.current), []);

  const add = async (targetId, label) => {
    clearTimeout(addedTimer.current);
    setAdded(false);
    setAdding(targetId);
    setError("");

    try {
      await addItem(targetId, 1);
      setOpen(false);
      setAnnouncement(`Added ${label} to your cart.`);
      setAdded(true);
      addedTimer.current = setTimeout(() => setAdded(false), ADDED_MS);
    } catch (addError) {
      // A newer cart change replaced this one; nothing went wrong.
      if (addError.code !== "STALE") {
        setError(addError.message);
        setOpen(true);
      }
    } finally {
      setAdding(null);
    }
  };

  const loadVariants = async () => {
    setLoadingVariants(true);

    try {
      setVariants((await getProduct(slug)).data.variants);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoadingVariants(false);
    }
  };

  const handleClick = () => {
    if (canQuickAdd) {
      add(variantId, name);
      return;
    }

    if (open) {
      setOpen(false);
      return;
    }

    setError("");
    setOpen(true);
    loadVariants();
  };

  const showEdition =
    variants !== null &&
    (new Set(variants.map((variant) => variant.edition)).size > 1 ||
      variants.some((variant) => variant.edition !== "Standard"));

  // Keyboard users land on the first version they can buy. Not `autoFocus`:
  // the menu first renders at the end of the page before it is placed under
  // the button, and focusing it there scrolled the whole page down. Focus
  // waits for the placement and never scrolls.
  useEffect(() => {
    if (!open || !variants) return undefined;

    const frame = requestAnimationFrame(() => {
      document
        .getElementById(popoverId)
        ?.querySelector(".add-to-cart__option:not(:disabled)")
        ?.focus({ preventScroll: true });
    });

    return () => cancelAnimationFrame(frame);
  }, [open, variants, popoverId]);

  return (
    <>
      <Button
        ref={buttonRef}
        type="button"
        variant="secondary"
        size="sm"
        className={`product-card__action${added ? " is-added" : ""} ${className}`}
        disabled={!inStock || (canQuickAdd && adding !== null)}
        aria-label={`Add to cart: ${name}`}
        aria-haspopup={canQuickAdd ? undefined : "true"}
        aria-expanded={canQuickAdd ? undefined : open}
        aria-controls={open ? popoverId : undefined}
        onClick={handleClick}
      >
        <span className="product-card__action-icon" aria-hidden="true">
          {canQuickAdd && adding !== null ? (
            <Spinner animation="border" size="sm" />
          ) : (
            <Icon name={added ? "check" : "cart-plus"} size={14} />
          )}
        </span>
        {/* The button's width comes from the card, not the label, so the
            shorter "Added" does not change its size. */}
        <span>{added ? "Added" : "Add to cart"}</span>
      </Button>

      <Overlay
        target={buttonRef}
        show={open}
        placement="bottom"
        flip
        rootClose
        onHide={(event) => {
          if (adding !== null) return;

          setOpen(false);
          // Escape returns keyboard users to the button; a click elsewhere
          // leaves focus where they clicked.
          if (event?.type === "keyup") buttonRef.current?.focus({ preventScroll: true });
        }}
      >
        <Popover id={popoverId} className="add-to-cart">
          <Popover.Body className="add-to-cart__body">
            {error ? (
              <p className="add-to-cart__error" role="alert">
                {error}
              </p>
            ) : null}
            {canQuickAdd ? null : loadingVariants && variants === null ? (
              <div className="add-to-cart__loading">
                <Spinner animation="border" size="sm" /> Loading versions…
              </div>
            ) : variants ? (
              <>
                <p className="add-to-cart__title">Choose a version</p>
                <ul className="add-to-cart__options">
                  {variants.map((variant) => {
                    const label = variantLabel(variant, showEdition);

                    return (
                      <li key={variant.id}>
                        <button
                          type="button"
                          className="add-to-cart__option"
                          disabled={!variant.inStock || adding !== null}
                          onClick={() => add(variant.id, `${name} (${label})`)}
                        >
                          <span className="add-to-cart__option-name">{label}</span>
                          <span className="add-to-cart__option-price">
                            {adding === variant.id ? (
                              <Spinner animation="border" size="sm" />
                            ) : variant.inStock ? (
                              formatMoney(variant.price, variant.currency)
                            ) : (
                              "Sold out"
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : null}
          </Popover.Body>
        </Popover>
      </Overlay>

      <span className="visually-hidden" role="status">
        {announcement}
      </span>
    </>
  );
}

export default AddToCart;
