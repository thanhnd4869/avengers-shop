import { useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Placeholder from "react-bootstrap/Placeholder";
import Row from "react-bootstrap/Row";
import { useNavigate, useSearchParams } from "react-router";

import Icon from "@components/Icon";
import Pagination from "@components/Pagination";
import PlatformSection from "@components/PlatformSection";
import ProductCard from "@components/ProductCard";
import useAsync from "@hooks/useAsync";
import { PATHS } from "@routes/paths";
import { getProductCategories, getProducts } from "@services/productService";

import "./ShopPage.css";

const PAGE_SIZE = 6;

const SORT_OPTIONS = [
  { value: "", label: "Best selling" },
  { value: "-rating", label: "Top rated" },
  { value: "-releaseDate", label: "Newest" },
  { value: "price", label: "Price: low to high" },
  { value: "-price", label: "Price: high to low" },
];

// Every filter lives in the URL, so a filtered shop can be shared or
// bookmarked and the back button undoes one change at a time.
const FILTER_KEYS = ["platform", "category", "q", "minPrice", "maxPrice", "sort"];

function readFilters(searchParams) {
  const filters = Object.fromEntries(FILTER_KEYS.map((key) => [key, searchParams.get(key) ?? ""]));
  const page = Number.parseInt(searchParams.get("page"), 10);

  return { ...filters, page: Number.isInteger(page) && page > 0 ? page : 1 };
}

/**
 * Builds the shop URL for a change: the given keys are replaced (empty values
 * removed) and, unless the page itself is being set, paging restarts at 1.
 */
function shopHref(searchParams, changes) {
  const next = new URLSearchParams(searchParams);

  if (!("page" in changes)) {
    next.delete("page");
  }

  for (const [key, value] of Object.entries(changes)) {
    if (value === "" || value === undefined || value === null || (key === "page" && value === 1)) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
  }

  const query = next.toString();

  return query ? `${PATHS.SHOP}?${query}` : PATHS.SHOP;
}

function GridPlaceholder() {
  return (
    <Row className="g-4">
      {Array.from({ length: PAGE_SIZE }, (_, index) => (
        <Col key={index} md={6}>
          <Placeholder as="div" animation="glow" className="d-flex gap-3">
            <Placeholder className="shop-page__placeholder-media rounded" />
            <div className="flex-grow-1">
              <Placeholder xs={8} />
              <Placeholder xs={5} />
              <Placeholder xs={10} />
            </div>
          </Placeholder>
        </Col>
      ))}
    </Row>
  );
}

/**
 * Price range fields. They hold their own draft so typing does not refetch on
 * every keystroke; the range is applied with the Filter button.
 */
function PriceFilter({ minPrice, maxPrice, bounds, onApply }) {
  const [draft, setDraft] = useState({ min: minPrice, max: maxPrice });
  const [applied, setApplied] = useState({ min: minPrice, max: maxPrice });

  // Follows the URL when it changes from outside, such as the back button or
  // the Clear filters link.
  if (applied.min !== minPrice || applied.max !== maxPrice) {
    setApplied({ min: minPrice, max: maxPrice });
    setDraft({ min: minPrice, max: maxPrice });
  }

  const submit = (event) => {
    event.preventDefault();

    let { min, max } = draft;

    // A reversed range is what the visitor meant the other way round.
    if (min !== "" && max !== "" && Number(min) > Number(max)) {
      [min, max] = [max, min];
    }

    onApply({ minPrice: min, maxPrice: max });
  };

  return (
    <Form onSubmit={submit} className="shop-page__price" aria-label="Price range">
      <InputGroup>
        <InputGroup.Text>$</InputGroup.Text>
        <Form.Control
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          placeholder={bounds ? String(Math.floor(bounds.min)) : "Min"}
          aria-label="Minimum price"
          value={draft.min}
          onChange={(event) => setDraft((current) => ({ ...current, min: event.target.value }))}
        />
        <InputGroup.Text>–</InputGroup.Text>
        <Form.Control
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          placeholder={bounds ? String(Math.ceil(bounds.max)) : "Max"}
          aria-label="Maximum price"
          value={draft.max}
          onChange={(event) => setDraft((current) => ({ ...current, max: event.target.value }))}
        />
        <Button type="submit" variant="primary">
          Filter
        </Button>
      </InputGroup>
    </Form>
  );
}

function SearchFilter({ value, onApply }) {
  const [draft, setDraft] = useState(value);
  const [applied, setApplied] = useState(value);

  if (applied !== value) {
    setApplied(value);
    setDraft(value);
  }

  return (
    <Form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onApply(draft.trim());
      }}
    >
      <InputGroup>
        <Form.Control
          type="search"
          placeholder="Search games..."
          aria-label="Search games"
          maxLength={100}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <Button type="submit" variant="primary" aria-label="Search">
          <Icon name="search" />
        </Button>
      </InputGroup>
    </Form>
  );
}

export function Component() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const filters = readFilters(searchParams);
  const { platform, category, q, minPrice, maxPrice, sort, page } = filters;

  const categories = useAsync(() => getProductCategories(), []);
  const listing = useAsync(
    () => getProducts({ page, limit: PAGE_SIZE, platform, category, q, minPrice, maxPrice, sort }),
    [page, platform, category, q, minPrice, maxPrice, sort],
  );

  // The page stays where it is: the visitor is looking at the filters they
  // just changed, not at the top of the shop.
  const apply = (changes) =>
    navigate(shopHref(searchParams, changes), { preventScrollReset: true });

  const products = listing.data?.data ?? [];
  const meta = listing.data?.meta;
  const categoryList = categories.data?.data ?? [];
  const hasFilters = FILTER_KEYS.some((key) => key !== "sort" && filters[key]);

  return (
    <Container className="shop-page">
      <h1 className="visually-hidden">Shop</h1>

      <PlatformSection
        activeSlug={platform}
        hrefFor={(slug) => shopHref(searchParams, { platform: slug === platform ? "" : slug })}
      />

      <div className="shop-page__filters">
        <Form.Select
          aria-label="Category"
          value={category}
          onChange={(event) => apply({ category: event.target.value })}
        >
          <option value="">All categories</option>
          {categoryList.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </Form.Select>

        <PriceFilter
          minPrice={minPrice}
          maxPrice={maxPrice}
          bounds={meta?.priceRange}
          onApply={apply}
        />

        <SearchFilter value={q} onApply={(value) => apply({ q: value })} />
      </div>

      <div className="shop-page__toolbar">
        <p className="shop-page__count mb-0" aria-live="polite">
          {meta && !listing.isLoading
            ? `${meta.total} ${meta.total === 1 ? "game" : "games"}`
            : "\u00a0"}
        </p>
        <div className="d-flex align-items-center gap-3">
          {hasFilters ? (
            <Button
              variant="link"
              className="shop-page__clear p-0"
              onClick={() =>
                navigate(sort ? `${PATHS.SHOP}?sort=${sort}` : PATHS.SHOP, {
                  preventScrollReset: true,
                })
              }
            >
              Clear filters
            </Button>
          ) : null}
          <Form.Select
            size="sm"
            aria-label="Sort by"
            className="shop-page__sort"
            value={sort}
            onChange={(event) => apply({ sort: event.target.value })}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        </div>
      </div>

      {listing.isLoading ? (
        <GridPlaceholder />
      ) : listing.error ? (
        <div className="shop-page__empty rounded" role="alert">
          <p className="mb-3">We could not load the games. Please try again.</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </div>
      ) : products.length ? (
        <>
          <Row className="g-4">
            {products.map((product) => (
              <Col key={product.id} md={6}>
                <ProductCard product={product} variant="list" showDescription />
              </Col>
            ))}
          </Row>
          <Pagination
            className="mt-5"
            page={meta.page}
            totalPages={meta.totalPages}
            hrefFor={(target) => shopHref(searchParams, { page: target })}
          />
        </>
      ) : (
        <div className="shop-page__empty rounded">
          <p className="mb-0">No games match these filters.</p>
        </div>
      )}
    </Container>
  );
}

Component.displayName = "ShopPage";
