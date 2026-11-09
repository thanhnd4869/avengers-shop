import Col from "react-bootstrap/Col";
import Placeholder from "react-bootstrap/Placeholder";
import Row from "react-bootstrap/Row";
import { Link } from "react-router";

import MediaImage from "@components/MediaImage";
import SectionHeading from "@components/SectionHeading";
import useAsync from "@hooks/useAsync";
import { buildPath, PATHS } from "@routes/paths";
import { getPosts } from "@services/postService";
import { formatDate } from "@utils/format";

import "./LatestPostsSection.css";

const LIMIT = 2;

function LatestPost({ post }) {
  const href = buildPath(PATHS.POST, { slug: post.slug });
  const author = post.author?.name ?? "Editorial";

  return (
    <article className="latest-post">
      <Link className="latest-post__media sf-media sf-media-zoom sf-ratio-16x9 rounded" to={href}>
        <MediaImage width={640} src={post.image.url} alt={post.image.alt} loading="lazy" />
        <span className="latest-post__comments">{post.commentCount}</span>
      </Link>
      <h3 className="latest-post__title">
        <Link to={href}>{post.title}</Link>
      </h3>
      <p className="latest-post__meta">
        <span className="latest-post__avatar">{author.charAt(0)}</span>
        <span>
          by <strong>{author}</strong> in{" "}
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, "en-US")}</time>
        </span>
      </p>
      <p className="latest-post__excerpt">{post.excerpt}</p>
      <Link className="latest-post__read-more rounded" to={href}>
        Read More
      </Link>
    </article>
  );
}

/**
 * Two column list of the newest posts. The page supplies the surrounding grid,
 * so the section only renders its own heading and items.
 */
function LatestPostsSection() {
  const posts = useAsync(() => getPosts({ limit: LIMIT }), []);

  return (
    <section className="mb-5">
      <SectionHeading highlight="Latest">Posts</SectionHeading>
      <Row className="g-4">
        {posts.isLoading
          ? Array.from({ length: LIMIT }, (_, index) => (
              <Col key={index} md={6}>
                <Placeholder as="div" animation="glow">
                  <Placeholder className="d-block w-100 sf-ratio-16x9 rounded" />
                  <Placeholder xs={10} className="mt-4" />
                  <Placeholder xs={7} />
                </Placeholder>
              </Col>
            ))
          : posts.data?.data.map((post) => (
              <Col key={post.id} md={6}>
                <LatestPost post={post} />
              </Col>
            ))}
      </Row>
    </section>
  );
}

export default LatestPostsSection;
