import { useState } from "react";

import "./QuantityInput.css";

/**
 * Minus, number, plus. Typing a number only applies once it is committed
 * (blur or Enter), so a half-typed value never reaches the cart.
 */
function QuantityInput({ value, min = 1, max, onChange, disabled = false, label = "Quantity" }) {
  const [draft, setDraft] = useState(String(value));
  const [shown, setShown] = useState(value);

  if (shown !== value) {
    setShown(value);
    setDraft(String(value));
  }

  const commit = (next) => {
    const parsed = Number.parseInt(next, 10);

    if (!Number.isInteger(parsed)) {
      setDraft(String(value));
      return;
    }

    const clamped = Math.min(Math.max(parsed, min), Math.max(max, min));

    setDraft(String(clamped));

    if (clamped !== value) onChange(clamped);
  };

  return (
    <div className="quantity-input" role="group" aria-label={label}>
      <button
        type="button"
        className="quantity-input__step"
        aria-label="Decrease quantity"
        disabled={disabled || value <= min}
        onClick={() => commit(value - 1)}
      >
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        className="quantity-input__field"
        aria-label={label}
        min={min}
        max={max}
        value={draft}
        disabled={disabled}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={(event) => commit(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit(event.currentTarget.value);
          }
        }}
      />
      <button
        type="button"
        className="quantity-input__step"
        aria-label="Increase quantity"
        disabled={disabled || value >= max}
        onClick={() => commit(value + 1)}
      >
        +
      </button>
    </div>
  );
}

export default QuantityInput;
