import { useId, useState } from "react";

import Icon from "@components/Icon";

import "./StarInput.css";

const LABELS = ["Terrible", "Poor", "Average", "Good", "Excellent"];

/**
 * Picks a rating from 1 to 5 stars. Built on native radio buttons, so the
 * arrow keys move between stars and screen readers announce the choice;
 * hovering previews a rating without choosing it.
 */
function StarInput({ value, onChange, disabled = false, invalid = false, label = "Your rating" }) {
  const name = useId();
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;

  return (
    <fieldset
      className={`star-input ${invalid ? "is-invalid" : ""}`}
      disabled={disabled}
      onMouseLeave={() => setHovered(0)}
    >
      <legend className="star-input__legend">{label}</legend>
      <div className="star-input__stars">
        {LABELS.map((text, index) => {
          const star = index + 1;

          return (
            <label
              key={star}
              className={`star-input__star ${star <= shown ? "is-on" : ""}`}
              onMouseEnter={() => setHovered(star)}
            >
              <input
                type="radio"
                name={name}
                value={star}
                checked={value === star}
                onChange={() => onChange(star)}
                className="visually-hidden"
              />
              <Icon name="star" size={22} />
              <span className="visually-hidden">
                {star} {star === 1 ? "star" : "stars"}, {text}
              </span>
            </label>
          );
        })}
        <span className="star-input__text" aria-hidden="true">
          {shown ? LABELS[shown - 1] : "Choose a rating"}
        </span>
      </div>
    </fieldset>
  );
}

export default StarInput;
