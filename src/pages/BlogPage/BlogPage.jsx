import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Placeholder from "react-bootstrap/Placeholder";
import Row from "react-bootstrap/Row";
import { Link, useSearchParams } from "react-router";

import MediaSidebar from "@components/MediaSidebar";
import Pagination from "@components/Pagination";
import PostCard from "@components/PostCard";
import SectionHeading from "@components/SectionHeading";
import Seo from "@components/Seo";
import useAsync from "@hooks/useAsync";
import { PATHS } from "@routes/paths";
import { getPostCategories, getPosts } from "@services/postService";

import "./BlogPage.css";

const PAGE_SIZE = 6;

/** The blog URL for another page of the same listing. */
function pageHref(searchParams, page) {
  const next = new URLSearchParams(searchParams);

  if (page === 1) next.delete("page");
  else next.set("page", page);

  const query = next.toString();

  return query ? `${PATHS.BLOG}?${query}` : PATHS.BLOG;
}

/**
 * The blog grid: every post, newest first, two to a row. The sidebar's search
 * narrows it with `?q=`, and a post's category link with `?category=`; both
 * live in the URL so a listing can be shared.
 */
export function Component() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") ?? "";
  const q = searchParams.get("q") ?? "";
  const page = Math.max(Number.parseInt(searchParams.get("page"), 10) || 1, 1);

  // Cached after the first call; only needed to name the filtered category.
  const categories = useAsync(() => getPostCategories(), []);
  const listing = useAsync(
    () => getPosts({ page, limit: PAGE_SIZE, category: category || undefined, q }),
    [page, category, q],
  );

  const categoryName =
    categories.data?.data.find((item) => item.slug === category)?.name ?? category;
  const posts = listing.data?.data ?? [];
  const meta = listing.data?.meta;
  const filtered = Boolean(q || category);

  return (
    <Container className="blog-page">
      <Seo
        title={category ? `${categoryName} – Blog` : "Blog"}
        description="Game news, reviews and guides from the Avengers Store team."
        path={PATHS.BLOG}
        noIndex={Boolean(q)}
      />
      <Row className="gx-5">
        <Col lg={8} className="blog-page__main">
          <h1 className="visually-hidden">Blog</h1>
          <SectionHeading highlight="Latest">News</SectionHeading>

          {filtered && meta ? (
            <p className="blog-page__summary" aria-live="polite">
              {meta.total} {meta.total === 1 ? "post" : "posts"}
              {category ? <> in {categoryName}</> : null}
              {q ? <> matching &ldquo;{q}&rdquo;</> : null}
              {" · "}
              <Link to={PATHS.BLOG}>Show all posts</Link>
            </p>
          ) : null}

          {listing.isLoading ? (
            <Row className="g-4">
              {Array.from({ length: 4 }, (_, index) => (
                <Col key={index} md={6}>
                  <Placeholder as="div" animation="glow">
                    <Placeholder className="d-block w-100 sf-ratio-16x9 rounded" />
                    <Placeholder xs={8} className="mt-3" />
                    <Placeholder xs={11} />
                  </Placeholder>
                </Col>
              ))}
            </Row>
          ) : listing.error ? (
            <div className="blog-page__empty rounded" role="alert">
              We could not load the posts. Please try again later.
            </div>
          ) : posts.length ? (
            <>
              <Row className="g-4">
                {posts.map((post) => (
                  <Col key={post.id} md={6}>
                    <PostCard post={post} />
                  </Col>
                ))}
              </Row>
              <Pagination
                className="mt-5"
                page={meta.page}
                totalPages={meta.totalPages}
                hrefFor={(target) => pageHref(searchParams, target)}
              />
            </>
          ) : (
            <div className="blog-page__empty rounded">
              {filtered ? "No posts match your search." : "No posts yet."}
            </div>
          )}
        </Col>
        <Col lg={4}>
          <div className="blog-page__sidebar">
            <MediaSidebar searchValue={q} />
          </div>
        </Col>
      </Row>
    </Container>
  );
}

Component.displayName = "BlogPage";
