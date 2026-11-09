import { useCallback, useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Placeholder from "react-bootstrap/Placeholder";
import Row from "react-bootstrap/Row";
import { Link, useParams } from "react-router";

import Icon from "@components/Icon";
import MediaImage from "@components/MediaImage";
import MediaSidebar from "@components/MediaSidebar";
import PostCard from "@components/PostCard";
import PostComments from "@components/PostComments";
import PostShare from "@components/PostShare";
import RichText from "@components/RichText";
import SectionHeading from "@components/SectionHeading";
import useAsync from "@hooks/useAsync";
import { PATHS } from "@routes/paths";
import { getPost } from "@services/postService";
import { formatDate } from "@utils/format";

import "./PostPage.css";

function PostBody({ post, commentCount }) {
  return (
    <article className="post-page__article">
      <Link to={`${PATHS.BLOG}?category=${post.category.slug}`} className="post-page__category">
        {post.category.name}
      </Link>
      <h1 className="post-page__title">{post.title}</h1>
      <p className="post-page__meta">
        <Icon name="calendar" size={12} />
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, "en-US")}</time>
        <Icon name="comment" size={12} className="ms-3" />
        <a href="#post-comments-title" className="post-page__comments-link">
          {commentCount} {commentCount === 1 ? "comment" : "comments"}
        </a>
      </p>
      <div className="post-page__image sf-media sf-ratio-16x9 rounded">
        <MediaImage width={1280} src={post.image.url} alt={post.image.alt} />
      </div>
      <RichText text={post.content || post.excerpt} className="post-page__content" />
      <PostShare title={post.title} url={window.location.href} image={post.image.url} />
    </article>
  );
}

/** One blog post with sharing, related posts, comments and the sidebar. */
export function Component() {
  const { slug } = useParams();
  const { data, isLoading, error } = useAsync(() => getPost(slug), [slug]);
  const post = data?.data;
  // The comments section reports the live count after each change.
  const [liveCount, setLiveCount] = useState({ slug: null, count: 0 });
  const commentCount = liveCount.slug === slug ? liveCount.count : (post?.commentCount ?? 0);
  const handleCountChange = useCallback((count) => setLiveCount({ slug, count }), [slug]);

  let content;

  if (isLoading) {
    content = (
      <Placeholder as="div" animation="glow" aria-label="Loading the post">
        <Placeholder xs={3} />
        <Placeholder xs={10} size="lg" className="mt-2" />
        <Placeholder className="d-block w-100 sf-ratio-16x9 rounded mt-4" />
        <Placeholder xs={12} className="mt-4" />
        <Placeholder xs={11} />
      </Placeholder>
    );
  } else if (!post) {
    content = (
      <div className="post-page__missing rounded" role="alert">
        <h1 className="h3">{error?.status === 404 ? "Post not found" : "Something went wrong"}</h1>
        <p>
          {error?.status === 404
            ? "This post was removed, or the link is mistyped."
            : "We could not load this post. Please try again."}
        </p>
        <Button as={Link} to={PATHS.BLOG} variant="primary">
          Back to the blog
        </Button>
      </div>
    );
  } else {
    content = (
      <>
        <PostBody post={post} commentCount={commentCount} />
        {post.related.length ? (
          <section className="post-page__related" aria-labelledby="related-posts">
            <SectionHeading highlight="Related" className="mb-4">
              <span id="related-posts">Posts</span>
            </SectionHeading>
            <Row className="g-4">
              {post.related.map((item) => (
                <Col key={item.id} md={6}>
                  <PostCard post={item} />
                </Col>
              ))}
            </Row>
          </section>
        ) : null}
        <PostComments key={slug} slug={slug} onCountChange={handleCountChange} />
      </>
    );
  }

  return (
    <Container className="post-page">
      <Row className="gx-5">
        <Col lg={8} className="post-page__main">
          {content}
        </Col>
        <Col lg={4}>
          <div className="post-page__sidebar">
            <MediaSidebar />
          </div>
        </Col>
      </Row>
    </Container>
  );
}

Component.displayName = "PostPage";
