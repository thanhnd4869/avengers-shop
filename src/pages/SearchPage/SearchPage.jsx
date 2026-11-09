import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Placeholder from "react-bootstrap/Placeholder";
import Row from "react-bootstrap/Row";
import { Link, useSearchParams } from "react-router";

import MediaSidebar from "@components/MediaSidebar";
import PostCard from "@components/PostCard";
import ProductCard from "@components/ProductCard";
import SectionHeading from "@components/SectionHeading";
import Seo from "@components/Seo";
import useAsync from "@hooks/useAsync";
import { PATHS } from "@routes/paths";
import { getPosts } from "@services/postService";
import { getProducts } from "@services/productService";

import "./SearchPage.css";

const PRODUCT_LIMIT = 4;
const POST_LIMIT = 4;
const NOTHING = Promise.resolve({ data: [], meta: { total: 0 } });

function Results({ highlight, title, noun, state, viewAllTo, render }) {
  const items = state.data?.data ?? [];
  const total = state.data?.meta?.total ?? 0;

  return (
    <section className="search-page__section" aria-label={`${highlight} ${title}`}>
      <SectionHeading
        highlight={highlight}
        viewAllTo={total > items.length ? viewAllTo : undefined}
        viewAllLabel={`All ${total} ${noun}`}
      >
        {title}
      </SectionHeading>
      {state.isLoading ? (
        <Placeholder as="div" animation="glow">
          <Placeholder xs={12} />
          <Placeholder xs={8} />
        </Placeholder>
      ) : state.error ? (
        <p className="search-page__empty rounded" role="alert">
          We could not search the {noun} right now. Please try again.
        </p>
      ) : items.length ? (
        <Row className="g-4">{items.map(render)}</Row>
      ) : (
        <p className="search-page__empty rounded">No {noun} match your search.</p>
      )}
    </section>
  );
}

/**
 * What the header search found across the site: games from the shop and
 * posts from the blog, each linking on to its full listing.
 */
export function Component() {
  const [searchParams] = useSearchParams();
  const q = (searchParams.get("q") ?? "").trim().slice(0, 100);
  const encoded = encodeURIComponent(q);

  const products = useAsync(() => (q ? getProducts({ q, limit: PRODUCT_LIMIT }) : NOTHING), [q]);
  const posts = useAsync(() => (q ? getPosts({ q, limit: POST_LIMIT }) : NOTHING), [q]);

  return (
    <Container className="search-page">
      <Seo title={q ? `Search: ${q}` : "Search"} noIndex />
      <Row className="gx-5">
        <Col lg={8} className="search-page__main">
          <h1 className="search-page__title">
            {q ? (
              <>
                Search results for <span>&ldquo;{q}&rdquo;</span>
              </>
            ) : (
              "Search"
            )}
          </h1>

          {q ? (
            <>
              <Results
                highlight="Games"
                title="Found"
                noun="games"
                state={products}
                viewAllTo={`${PATHS.SHOP}?q=${encoded}`}
                render={(product) => (
                  <Col key={product.id} md={6}>
                    <ProductCard product={product} variant="list" />
                  </Col>
                )}
              />
              <Results
                highlight="Posts"
                title="Found"
                noun="posts"
                state={posts}
                viewAllTo={`${PATHS.BLOG}?q=${encoded}`}
                render={(post) => (
                  <Col key={post.id} md={6}>
                    <PostCard post={post} />
                  </Col>
                )}
              />
            </>
          ) : (
            <p className="search-page__empty rounded">
              Use the search icon at the top of the page, or browse the{" "}
              <Link to={PATHS.SHOP}>shop</Link> and the <Link to={PATHS.BLOG}>blog</Link>.
            </p>
          )}
        </Col>
        <Col lg={4}>
          <div className="search-page__sidebar">
            <MediaSidebar />
          </div>
        </Col>
      </Row>
    </Container>
  );
}

Component.displayName = "SearchPage";
