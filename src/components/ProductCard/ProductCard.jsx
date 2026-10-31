import { useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { Link } from "react-router";

import Icon from "@components/Icon";
import useCart from "@hooks/useCart";
import { buildPath, PATHS } from "@routes/paths";
import { formatPriceRange } from "@utils/format";

import "./ProductCard.css";

function Rating({ value, count, showCount = true }) {
  return (
    <div className="product-card__rating" aria-label={`Rated ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon
          key={star}
          name="star"
          size={12}
          className={star <= Math.round(value) ? "is-filled" : ""}
        />
      ))}
      {showCount ? <span className="product-card__rating-count">({count})</span> : null}
    </div>
  );
}

/**
 * Product tile rendered either as a stacked `grid` card or as a `list` row with
 * the artwork beside the details, which is the shape the reference uses for the
 * best sellers and the sidebar.
 */
function ProductCard({ product, variant = "grid", showDescription = false }) {
  const {
    slug,
    name,
    shortDescription,
    image,
    priceMin,
    priceMax,
    originalPriceMin,
    currency,
    ratingAverage,
    ratingCount,
    hasVariants,
    variantId,
    inStock,
    platforms,
  } = product;
  const { addItem } = useCart();
  const [addState, setAddState] = useState("idle");
  const [addError, setAddError] = useState("");
  const resetTimer = useRef();

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const handleQuickAdd = async () => {
    clearTimeout(resetTimer.current);
    setAddState("adding");
    setAddError("");

    try {
      await addItem(variantId, 1);
      setAddState("added");
    } catch (error) {
      setAddState("idle");
      if (error.code !== "STALE") {
        setAddError(error.message);
        window.alert(error.message);
      }
      return;
    }

    // The tick confirms the add for a moment, then the button is ready again.
    resetTimer.current = setTimeout(() => setAddState("idle"), 1800);
  };

  const href = buildPath(PATHS.PRODUCT, { slug });
  const isDiscounted = originalPriceMin != null && originalPriceMin > priceMin;
  // Key shoppers compare deals by percentage, so the badge shows it instead of
  // a generic "Sale" label.
  const discountPercent = isDiscounted
    ? Math.round(((originalPriceMin - priceMin) / originalPriceMin) * 100)
    : 0;
  const isList = variant === "list";

  const media = (
    <Link
      to={href}
      className={`product-card__media sf-media sf-media-zoom rounded ${isList ? "sf-ratio-3x4" : "sf-ratio-4x3"}`}
    >
      <img src={image.url} alt={image.alt} loading="lazy" />
      {isDiscounted ? <span className="product-card__badge">-{discountPercent}%</span> : null}
      {!inStock ? <span className="product-card__sold-out">Sold out</span> : null}
    </Link>
  );

  // Every variant shows the same details in the same order: platforms, name,
  // rating, then price and action. Shoppers find each one in the same place
  // whichever card they are looking at.
  const platformList = (
    <ul className="product-card__platforms list-unstyled d-flex flex-wrap gap-1 mb-0">
      {platforms.map((platform) => (
        <li key={platform.slug} className="product-card__platform rounded-1">
          {platform.name}
        </li>
      ))}
    </ul>
  );

  const price = (
    <p className="product-card__price mb-0">
      {isDiscounted ? (
        <span className="product-card__price-original">
          {formatPriceRange(originalPriceMin, originalPriceMin, currency)}
        </span>
      ) : null}
      {formatPriceRange(priceMin, priceMax, currency)}
    </p>
  );

  // The button shows either its label or its icon, never both: the label where
  // the card has room, the icon when a container query finds it too narrow.
  // `aria-label` keeps the button named either way and `title` shows the
  // wording on hover.
  //
  // A game with one variant goes straight into the cart; one with several
  // opens its page so the shopper picks the platform first.
  const quickAdd = !hasVariants && Boolean(variantId);
  let actionLabel = hasVariants || !variantId ? "Select options" : "Add to cart";

  if (addState === "adding") actionLabel = "Adding…";
  if (addState === "added") actionLabel = "Added";

  const actionContent = (
    <>
      <Icon
        name={addState === "added" ? "check" : quickAdd ? "cart-plus" : "options"}
        size={18}
        className="product-card__action-icon"
      />
      <span className="product-card__action-label">{actionLabel}</span>
    </>
  );
  const action = quickAdd ? (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={!inStock || addState === "adding"}
      className="product-card__action"
      aria-label={`${actionLabel}: ${name}`}
      title={addError || actionLabel}
      onClick={handleQuickAdd}
    >
      {actionContent}
    </Button>
  ) : (
    <Button
      as={Link}
      to={href}
      variant="secondary"
      size="sm"
      disabled={!inStock}
      className="product-card__action"
      aria-label={actionLabel}
      title={actionLabel}
    >
      {actionContent}
    </Button>
  );

  // Hero-style tile: artwork fills the card and the details sit on a gradient
  // over its lower edge, so one deal can anchor a section.
  if (variant === "featured") {
    return (
      <article className="product-card product-card--featured sf-media sf-media-zoom rounded h-100">
        <img src={image.url} alt={image.alt} loading="lazy" />
        {isDiscounted ? <span className="product-card__badge">-{discountPercent}%</span> : null}
        <div className="product-card__overlay">
          <div className="mb-2">{platformList}</div>
          <h3 className="product-card__title product-card__title--lg">
            <Link to={href}>{name}</Link>
          </h3>
          <div className="d-flex align-items-end justify-content-between gap-3 flex-wrap">
            {price}
            {action}
          </div>
        </div>
      </article>
    );
  }

  // Leaderboard row: the artwork beside a column of details. The name is its
  // own grid item, apart from the rating, price and action, so it is never
  // squeezed by them and may wrap as far as it needs. The grid sits in an inner
  // wrapper because a container query can restyle only the card's descendants.
  if (variant === "rank") {
    return (
      <article className="product-card product-card--rank">
        <div className="product-card__rank-grid">
          <div className="product-card__rank-platforms">{platformList}</div>
          {/* Names wrap rather than truncate when even a full line is too
              short: a cut-off game title is hard to recognise. */}
          <h3 className="product-card__title product-card__rank-title">
            <Link to={href}>{name}</Link>
          </h3>
          <Link
            to={href}
            className="product-card__media sf-media sf-media-zoom rounded sf-ratio-3x4"
          >
            <img src={image.url} alt={image.alt} loading="lazy" />
          </Link>
          <div className="product-card__rank-meta">
            <Rating value={ratingAverage} count={ratingCount} showCount={false} />
            {price}
          </div>
          {/* Its own grid cell, pinned to the card's bottom-right corner, so it
              sits in the same place however long the name is. */}
          <div className="product-card__rank-action">{action}</div>
        </div>
      </article>
    );
  }

  if (isList) {
    return (
      <article className="product-card product-card--list">
        <Row className="g-3">
          <Col xs={4}>{media}</Col>
          <Col xs={8} className="d-flex flex-column align-items-start gap-2">
            {platformList}
            <h3 className="product-card__title mb-0">
              <Link to={href}>{name}</Link>
            </h3>
            <Rating value={ratingAverage} count={ratingCount} showCount={false} />
            {showDescription && shortDescription ? (
              <p className="product-card__excerpt mb-0">{shortDescription}</p>
            ) : null}
            {/* Wraps as a unit: when the labelled button does not fit beside the
                price it drops below it instead of overflowing the card. */}
            <div className="product-card__list-buy">
              {price}
              {action}
            </div>
          </Col>
        </Row>
      </article>
    );
  }

  return (
    <article className="product-card h-100 d-flex flex-column">
      {media}

      <div className="product-card__body d-flex flex-column flex-grow-1">
        <div className="mb-2">{platformList}</div>

        <h3 className="product-card__title">
          <Link to={href}>{name}</Link>
        </h3>

        <Rating value={ratingAverage} count={ratingCount} />

        {/* Bottom-aligned: a price that wraps onto two lines grows upwards
            and the button stays in the card's bottom-right corner. */}
        <div className="product-card__footer mt-auto d-flex align-items-end justify-content-between gap-2">
          {price}
          {action}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
