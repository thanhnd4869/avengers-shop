import { useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Placeholder from "react-bootstrap/Placeholder";
import Row from "react-bootstrap/Row";
import Tab from "react-bootstrap/Tab";
import { Link, useParams } from "react-router";

import Icon from "@components/Icon";
import ProductCard from "@components/ProductCard";
import ProductGallery from "@components/ProductGallery";
import SectionHeading from "@components/SectionHeading";
import ShopSidebar from "@components/ShopSidebar";
import StarRating from "@components/StarRating";
import useAsync from "@hooks/useAsync";
import { PATHS } from "@routes/paths";
import { getProduct, getProductReviews, getRelatedProducts } from "@services/productService";
import { formatDate, formatPriceRange } from "@utils/format";

import "./ProductPage.css";

const RELATED_LIMIT = 4;
const REVIEWS_PAGE_SIZE = 10;
// The most reviews the API returns in one response.
const REVIEWS_MAX = 50;

function discountPercent(price, originalPrice) {
  return originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
}

function variantLabel(variant, showEdition) {
  return showEdition ? `${variant.platform.name} – ${variant.edition}` : variant.platform.name;
}

/**
 * Price, platform choice and the buy button. Choosing a platform shows its
 * own price and stock; until then the product's range is shown.
 */
function PurchasePanel({ product }) {
  const { variants } = product;
  const showEdition = new Set(variants.map((variant) => variant.edition)).size > 1;
  // A single variant needs no choice, so it is selected from the start.
  const [variantId, setVariantId] = useState(variants.length === 1 ? variants[0].id : "");
  const variant = variants.find((item) => item.id === variantId);

  const price = variant
    ? formatPriceRange(variant.price, variant.price, variant.currency)
    : formatPriceRange(product.priceMin, product.priceMax, product.currency);
  const originalPrice = variant ? variant.originalPrice : product.originalPriceMin;
  const showOriginal = variant
    ? originalPrice != null
    : originalPrice != null && product.priceMin === product.priceMax;

  return (
    <div className="product-page__purchase">
      <p className="product-page__price">
        {showOriginal ? (
          <span className="product-page__price-original">
            {formatPriceRange(originalPrice, originalPrice, product.currency)}
          </span>
        ) : null}
        {price}
      </p>

      {product.shortDescription ? (
        <p className="product-page__summary">{product.shortDescription}</p>
      ) : null}

      <Form
        onSubmit={(event) => event.preventDefault()}
        className="product-page__buy"
        aria-label="Buy this game"
      >
        {variants.length > 1 ? (
          <Form.Group controlId="product-variant" className="product-page__variant">
            <Form.Label>Platform</Form.Label>
            <Form.Select value={variantId} onChange={(event) => setVariantId(event.target.value)}>
              <option value="">Choose an option</option>
              {variants.map((item) => (
                <option key={item.id} value={item.id} disabled={!item.inStock}>
                  {variantLabel(item, showEdition)}
                  {item.inStock ? "" : " (sold out)"}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        ) : (
          <p className="product-page__single-variant mb-0">
            <span>Platform:</span> {variantLabel(variants[0], showEdition)}
          </p>
        )}

        {variant && !variant.inStock ? (
          <p className="product-page__stock is-out mb-0">Sold out on this platform</p>
        ) : null}

        {/* The cart is the next feature; until it exists the button explains
            itself rather than silently doing nothing. */}
        <Button
          type="submit"
          variant="primary"
          disabled
          title="The cart is coming soon"
          className="product-page__add"
        >
          <Icon name="cart-plus" size={16} className="me-2" />
          Add to cart
        </Button>
        <p className="product-page__note mb-0">Checkout opens soon.</p>
      </Form>
    </div>
  );
}

function ProductMeta({ product }) {
  return (
    <dl className="product-page__meta">
      {product.categories.length ? (
        <div>
          <dt>Categories:</dt>
          <dd>
            {product.categories.map((category, index) => (
              <span key={category.slug}>
                {index > 0 ? ", " : null}
                <Link to={`${PATHS.SHOP}?category=${category.slug}`}>{category.name}</Link>
              </span>
            ))}
          </dd>
        </div>
      ) : null}
      {product.tags.length ? (
        <div>
          <dt>Tags:</dt>
          <dd>{product.tags.join(", ")}</dd>
        </div>
      ) : null}
    </dl>
  );
}

function Reviews({ slug, count }) {
  // "Show more" asks for a longer first page rather than appending pages, so
  // the list is always one consistent response.
  const [limit, setLimit] = useState(REVIEWS_PAGE_SIZE);
  const { data, isLoading, error } = useAsync(
    () => getProductReviews(slug, { limit }),
    [slug, limit],
  );
  const [shown, setShown] = useState(null);

  // Keeps the current list on screen while a longer one loads.
  if (data && data !== shown) {
    setShown(data);
  }

  const reviews = shown?.data ?? [];
  const total = shown?.meta.total ?? 0;

  if (error && !reviews.length) {
    return <p className="mb-0">We could not load the reviews. Please try again later.</p>;
  }

  if (!isLoading && !reviews.length) {
    return <p className="mb-0">There are no reviews yet.</p>;
  }

  return (
    <>
      <h2 className="product-page__tab-title">
        {total || count} {(total || count) === 1 ? "review" : "reviews"}
      </h2>
      <ol className="product-page__reviews list-unstyled mb-0">
        {reviews.map((review) => (
          <li key={review.id} className="product-page__review">
            <StarRating value={review.rating} size={12} />
            <p className="product-page__review-meta">
              by <strong>{review.authorName}</strong> on{" "}
              <time dateTime={review.createdAt}>{formatDate(review.createdAt)}</time>
            </p>
            <p className="mb-0">{review.content}</p>
          </li>
        ))}
      </ol>
      {isLoading ? (
        <Placeholder as="p" animation="glow" className="mt-3">
          <Placeholder xs={6} />
        </Placeholder>
      ) : null}
      {reviews.length < total && limit < REVIEWS_MAX && !isLoading ? (
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => setLimit((current) => Math.min(current + REVIEWS_PAGE_SIZE, REVIEWS_MAX))}
        >
          Show more reviews
        </Button>
      ) : null}
    </>
  );
}

function RelatedProducts({ slug }) {
  const { data, error } = useAsync(
    () => getRelatedProducts(slug, { limit: RELATED_LIMIT }),
    [slug],
  );
  const products = error ? [] : (data?.data ?? []);

  if (!products.length) {
    return null;
  }

  return (
    <section className="product-page__related" aria-labelledby="related-products">
      <SectionHeading highlight="Related" className="mb-4">
        <span id="related-products">Products</span>
      </SectionHeading>
      <Row className="g-4">
        {products.map((product) => (
          <Col key={product.id} sm={6}>
            <ProductCard product={product} variant="list" />
          </Col>
        ))}
      </Row>
    </section>
  );
}

function ProductPlaceholder() {
  return (
    <Row className="g-4" aria-label="Loading product">
      <Col md={6}>
        <Placeholder as="div" animation="glow">
          <Placeholder className="d-block w-100 sf-ratio-3x4 rounded" />
        </Placeholder>
      </Col>
      <Col md={6}>
        <Placeholder as="div" animation="glow">
          <Placeholder xs={9} size="lg" />
          <Placeholder xs={4} />
          <Placeholder xs={12} className="mt-4" />
          <Placeholder xs={10} />
          <Placeholder xs={11} />
        </Placeholder>
      </Col>
    </Row>
  );
}

function NotFound() {
  return (
    <div className="product-page__missing rounded">
      <h1 className="h3">Game not found</h1>
      <p>This game is no longer sold, or the link is mistyped.</p>
      <Button as={Link} to={PATHS.SHOP} variant="primary">
        Browse the shop
      </Button>
    </div>
  );
}

function ProductDetails({ product }) {
  const images = [product.image, ...product.gallery];
  const percent = discountPercent(product.priceMin, product.originalPriceMin);
  const platformNames = product.platforms.map((platform) => platform.name).join(", ");

  return (
    <>
      <Row className="g-4 mb-5">
        <Col md={6}>
          <ProductGallery
            images={images}
            badge={percent ? <span className="product-page__badge">-{percent}%</span> : null}
          />
        </Col>
        <Col md={6}>
          <h1 className="product-page__title">{product.name}</h1>
          {product.ratingCount ? (
            <a href="#product-tabs" className="product-page__rating">
              <StarRating value={product.ratingAverage} />
              <span>
                {product.ratingAverage.toFixed(1)} ({product.ratingCount}{" "}
                {product.ratingCount === 1 ? "review" : "reviews"})
              </span>
            </a>
          ) : null}
          <PurchasePanel key={product.id} product={product} />
          <ProductMeta product={product} />
        </Col>
      </Row>

      <Tab.Container defaultActiveKey="description">
        <section id="product-tabs" className="product-page__tabs rounded">
          <Nav as="ul" className="product-page__tab-nav" role="tablist">
            <Nav.Item as="li">
              <Nav.Link eventKey="description">Description</Nav.Link>
            </Nav.Item>
            <Nav.Item as="li">
              <Nav.Link eventKey="info">Additional information</Nav.Link>
            </Nav.Item>
            <Nav.Item as="li">
              <Nav.Link eventKey="reviews">Reviews ({product.ratingCount})</Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content className="product-page__tab-body">
            <Tab.Pane eventKey="description">
              <p className="product-page__description mb-0">
                {product.description || product.shortDescription || "No description yet."}
              </p>
            </Tab.Pane>
            <Tab.Pane eventKey="info">
              <table className="product-page__info">
                <tbody>
                  <tr>
                    <th scope="row">Platform</th>
                    <td>{platformNames}</td>
                  </tr>
                  <tr>
                    <th scope="row">Release date</th>
                    <td>{formatDate(product.releaseDate)}</td>
                  </tr>
                  <tr>
                    <th scope="row">Delivery</th>
                    <td>Digital key, shown in your account and emailed after payment</td>
                  </tr>
                </tbody>
              </table>
            </Tab.Pane>
            <Tab.Pane eventKey="reviews" mountOnEnter>
              <Reviews slug={product.slug} count={product.ratingCount} />
            </Tab.Pane>
          </Tab.Content>
        </section>
      </Tab.Container>

      <RelatedProducts slug={product.slug} />
    </>
  );
}

export function Component() {
  const { slug } = useParams();
  const { data, isLoading, error } = useAsync(() => getProduct(slug), [slug]);

  let content;

  if (isLoading) {
    content = <ProductPlaceholder />;
  } else if (error?.status === 404) {
    content = <NotFound />;
  } else if (error) {
    content = (
      <div className="product-page__missing rounded" role="alert">
        <p>We could not load this game. Please try again.</p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Reload
        </Button>
      </div>
    );
  } else {
    content = <ProductDetails key={data.data.id} product={data.data} />;
  }

  return (
    <Container className="product-page">
      <Row className="gx-5">
        <Col lg={8} className="product-page__main">
          {content}
        </Col>
        <Col lg={4}>
          <div className="product-page__sidebar">
            <ShopSidebar />
          </div>
        </Col>
      </Row>
    </Container>
  );
}

Component.displayName = "ProductPage";
