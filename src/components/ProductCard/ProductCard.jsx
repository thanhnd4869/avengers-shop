import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { Link } from "react-router";

import Icon from "@components/Icon";
import MediaImage from "@components/MediaImage";
import { buildPath, PATHS } from "@routes/paths";
import { formatMoney } from "@utils/format";

import AddToCart from "./AddToCart";

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
 * The price on a line of its own. Each amount stays whole; a range breaks
 * after the dash when the card is too narrow for it, never inside a number.
 */
function Price({ priceMin, priceMax, originalPriceMin, currency, isDiscounted }) {
  return (
    <p className="product-card__price mb-0">
      {isDiscounted ? (
        <s className="product-card__price-original">{formatMoney(originalPriceMin, currency)}</s>
      ) : null}
      <span className="product-card__price-current">
        <span className="product-card__amount">{formatMoney(priceMin, currency)}</span>
        {priceMax > priceMin ? (
          <>
            {" "}
            <span className="product-card__amount">– {formatMoney(priceMax, currency)}</span>
          </>
        ) : null}
      </span>
    </p>
  );
}

/**
 * Product tile in one of four shapes, all with the same details in the same
 * order: platforms, name, rating, price, then "Add to cart". The price and
 * the button each get a line of their own, so a long amount can never push
 * the button out of the card, and only the artwork and the name lead to the
 * product page.
 *
 * - `grid`     stacked card
 * - `list`     artwork beside the details (shop, sidebars, Coming Soon)
 * - `rank`     leaderboard row (Best Sellers)
 * - `featured` artwork filling the card with the details over it (Hot Deals)
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
    inStock,
    platforms,
  } = product;

  const href = buildPath(PATHS.PRODUCT, { slug });
  const isDiscounted = originalPriceMin != null && originalPriceMin > priceMin;
  // Key shoppers compare deals by percentage, so the badge shows it instead of
  // a generic "Sale" label.
  const discountPercent = isDiscounted
    ? Math.round(((originalPriceMin - priceMin) / originalPriceMin) * 100)
    : 0;

  const platformList = (
    <ul className="product-card__platforms list-unstyled d-flex flex-wrap gap-1 mb-0">
      {platforms.map((platform) => (
        <li key={platform.slug} className="product-card__platform rounded-1">
          {platform.name}
        </li>
      ))}
    </ul>
  );
  const title = (
    <h3 className="product-card__title">
      <Link to={href} title={name}>
        {name}
      </Link>
    </h3>
  );
  const price = (
    <Price
      priceMin={priceMin}
      priceMax={priceMax}
      originalPriceMin={originalPriceMin}
      currency={currency}
      isDiscounted={isDiscounted}
    />
  );
  const action = <AddToCart product={product} />;
  const badge = isDiscounted ? (
    <span className="product-card__badge">-{discountPercent}%</span>
  ) : null;
  const soldOut = !inStock ? <span className="product-card__sold-out">Sold out</span> : null;
  const media = (ratio) => (
    <Link
      to={href}
      className={`product-card__media sf-media sf-media-zoom rounded ${ratio}`}
      tabIndex={-1}
      aria-hidden="true"
    >
      <MediaImage width={640} src={image.url} alt="" loading="lazy" />
      {badge}
      {soldOut}
    </Link>
  );

  if (variant === "featured") {
    return (
      <article className="product-card product-card--featured sf-media sf-media-zoom rounded h-100">
        <MediaImage width={640} src={image.url} alt="" loading="lazy" />
        {badge}
        <div className="product-card__overlay">
          <div className="mb-2">{platformList}</div>
          {title}
          <div className="product-card__buy product-card__buy--inline">
            {price}
            {action}
          </div>
        </div>
      </article>
    );
  }

  if (variant === "rank") {
    return (
      <article className="product-card product-card--rank">
        {media("sf-ratio-3x4")}
        <div className="product-card__details">
          {platformList}
          {title}
          <Rating value={ratingAverage} count={ratingCount} showCount={false} />
          <div className="product-card__buy">
            {price}
            {action}
          </div>
        </div>
      </article>
    );
  }

  if (variant === "list") {
    return (
      <article className="product-card product-card--list">
        <Row className="g-3">
          <Col xs={4}>{media("sf-ratio-3x4")}</Col>
          <Col xs={8} className="product-card__details">
            {platformList}
            {title}
            <Rating value={ratingAverage} count={ratingCount} showCount={false} />
            {showDescription && shortDescription ? (
              <p className="product-card__excerpt mb-0">{shortDescription}</p>
            ) : null}
            <div className="product-card__buy">
              {price}
              {action}
            </div>
          </Col>
        </Row>
      </article>
    );
  }

  return (
    <article className="product-card product-card--grid h-100">
      {media("sf-ratio-4x3")}
      <div className="product-card__details">
        {platformList}
        {title}
        <Rating value={ratingAverage} count={ratingCount} />
        <div className="product-card__buy">
          {price}
          {action}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
