import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { Link } from "react-router";

import Icon from "@components/Icon";
import MediaImage from "@components/MediaImage";
import { buildPath, PATHS } from "@routes/paths";
import { formatDate } from "@utils/format";

import "./PostCard.css";

function PostMeta({ post, showComments = false, className = "" }) {
  return (
    <p className={`post-card__meta mb-0 d-inline-flex align-items-center gap-2 ${className}`}>
      <Icon name="calendar" size={12} />
      <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, "en-US")}</time>
      {showComments ? (
        <>
          <Icon name="comment" size={12} className="ms-2" />
          <span>{post.commentCount} comments</span>
        </>
      ) : null}
    </p>
  );
}

function PostThumb({ post, href, ratio = "sf-ratio-16x9", showCategory = false, className = "" }) {
  return (
    <Link
      to={href}
      className={`post-card__media sf-media sf-media-zoom rounded ${ratio} ${className}`}
    >
      <MediaImage width={640} src={post.image.url} alt={post.image.alt} loading="lazy" />
      {showCategory ? <span className="post-card__category">{post.category.name}</span> : null}
    </Link>
  );
}

/**
 * Post teaser rendered in one of three shapes:
 *
 * - `grid`    stacked card used by the news grid
 * - `list`    thumbnail beside the text, used by the tabbed news list
 * - `compact` small thumbnail and title only, used by sidebar widgets
 *
 * `featured` promotes a `list` entry to a wide image above its text, which is how
 * the reference highlights the newest post.
 */
function PostCard({ post, variant = "grid", featured = false }) {
  const { slug, title, excerpt, image, commentCount, category } = post;
  const href = buildPath(PATHS.POST, { slug });

  if (variant === "compact") {
    return (
      <article className="post-card post-card--compact">
        <Row className="g-3">
          <Col xs={4}>
            <PostThumb post={post} href={href} ratio="sf-ratio-1x1" />
          </Col>
          <Col xs={8}>
            <h3 className="post-card__title post-card__title--sm">
              <Link to={href}>{title}</Link>
            </h3>
            <PostMeta post={post} className="mt-2" />
          </Col>
        </Row>
      </article>
    );
  }

  if (variant === "list") {
    const body = (
      <>
        <h3 className="post-card__title">
          <Link to={href}>{title}</Link>
        </h3>
        <PostMeta post={post} showComments className="my-2" />
        <p className="post-card__excerpt mb-0">{excerpt}</p>
      </>
    );

    return (
      <article className="post-card post-card--list">
        {featured ? (
          <>
            <PostThumb post={post} href={href} showCategory className="mb-3" />
            {body}
          </>
        ) : (
          <Row className="g-3">
            <Col sm={4} lg={3}>
              <PostThumb post={post} href={href} ratio="sf-ratio-4x3" showCategory />
            </Col>
            <Col sm={8} lg={9}>
              {body}
            </Col>
          </Row>
        )}
      </article>
    );
  }

  return (
    <article className="post-card h-100 d-flex flex-column">
      <Link to={href} className="post-card__media sf-media sf-media-zoom sf-ratio-16x9 rounded">
        <MediaImage width={640} src={image.url} alt={image.alt} loading="lazy" />
        <span className="post-card__comments" aria-label={`${commentCount} comments`}>
          {commentCount}
        </span>
        <span className="post-card__category">{category.name}</span>
      </Link>
      <div className="post-card__body d-flex flex-column flex-grow-1">
        <h3 className="post-card__title">
          <Link to={href}>{title}</Link>
        </h3>
        <p className="post-card__excerpt">{excerpt}</p>
        <div className="post-card__footer mt-auto d-flex align-items-center justify-content-between gap-3">
          <Link to={href} className="post-card__read-more rounded">
            Read More
          </Link>
          <PostMeta post={post} />
        </div>
      </div>
    </article>
  );
}

export default PostCard;
