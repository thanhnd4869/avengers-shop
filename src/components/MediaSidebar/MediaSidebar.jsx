import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Placeholder from "react-bootstrap/Placeholder";

import GalleryGrid from "@components/GalleryGrid";
import Icon from "@components/Icon";
import ProductCard from "@components/ProductCard";
import SocialWidget from "@components/SocialWidget";
import Widget from "@components/Widget";
import useAsync from "@hooks/useAsync";
import { PATHS } from "@routes/paths";
import { getMedia } from "@services/mediaService";
import { getProducts } from "@services/productService";

import "./MediaSidebar.css";

const POPULAR_LIMIT = 3;

/**
 * Sidebar that accompanies the home page content column.
 *
 * Every block is a `Widget`, so adding or reordering one is a matter of
 * composition rather than new styling.
 */
function MediaSidebar({ searchValue = "" }) {
  const videos = useAsync(() => getMedia({ type: "video", limit: 1 }), []);
  const shots = useAsync(() => getMedia({ type: "screenshot", limit: 6 }), []);
  // Sorting by rating keeps this widget from repeating the best sellers listed
  // in the content column.
  const popularProducts = useAsync(
    () => getProducts({ sort: "-rating", limit: POPULAR_LIMIT }),
    [],
  );

  const latestVideo = videos.error ? null : videos.data?.data[0];
  const screenshots = shots.error ? [] : (shots.data?.data ?? []);
  const products = popularProducts.error ? [] : (popularProducts.data?.data ?? []);

  return (
    <aside className="media-sidebar d-grid gap-4">
      <Widget>
        <Form action={PATHS.BLOG}>
          <Form.Label htmlFor="home-search" className="visually-hidden">
            Search
          </Form.Label>
          <InputGroup>
            {/* Keyed so it shows the blog's current search after navigating. */}
            <Form.Control
              key={searchValue}
              id="home-search"
              name="q"
              type="search"
              placeholder="Search..."
              maxLength={100}
              defaultValue={searchValue}
            />
            <Button type="submit" variant="primary" aria-label="Submit search">
              <Icon name="search" />
            </Button>
          </InputGroup>
        </Form>
      </Widget>

      <SocialWidget />

      {latestVideo ? (
        <Widget title="Latest Video">
          <a
            className="d-block sf-media sf-media-zoom sf-ratio-16x9 rounded position-relative"
            href={latestVideo.url}
          >
            <img src={latestVideo.image.url} alt={latestVideo.image.alt} loading="lazy" />
            <span className="media-sidebar__play" aria-hidden="true" />
          </a>
        </Widget>
      ) : null}

      {screenshots.length ? (
        <Widget title="Latest Screenshots">
          <GalleryGrid items={screenshots} count={6} span={6} gutter="g-2" />
        </Widget>
      ) : null}

      {popularProducts.isLoading || products.length ? (
        <Widget title="Most Popular">
          {popularProducts.isLoading ? (
            <Placeholder as="div" animation="glow">
              <Placeholder xs={12} />
              <Placeholder xs={8} />
            </Placeholder>
          ) : (
            products.map((product) => (
              <ProductCard key={product.id} product={product} variant="list" />
            ))
          )}
        </Widget>
      ) : null}
    </aside>
  );
}

export default MediaSidebar;
