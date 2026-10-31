import Icon from "@components/Icon";

import "./StarRating.css";

/** Five stars with as many filled as `value` rounds to. */
function StarRating({ value, size = 14, className = "" }) {
  return (
    <span className={`star-rating ${className}`} role="img" aria-label={`Rated ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon
          key={star}
          name="star"
          size={size}
          className={star <= Math.round(value) ? "is-filled" : ""}
        />
      ))}
    </span>
  );
}

export default StarRating;
