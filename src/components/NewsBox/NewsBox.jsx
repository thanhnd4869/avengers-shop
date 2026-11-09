import { useState } from "react";
import { Link } from "react-router";

import Icon from "@components/Icon";
import MediaImage from "@components/MediaImage";
import { buildPath, PATHS } from "@routes/paths";
import { formatDate } from "@utils/format";

import "./NewsBox.css";

/**
 * Two column news box used at the top of the Latest News section.
 *
 * The left column lists the latest posts and the right column previews the
 * post that is currently selected.
 */
function NewsBox({ posts }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = posts[activeIndex] ?? posts[0];

  if (!active) {
    return null;
  }

  const activeHref = buildPath(PATHS.POST, { slug: active.slug });

  return (
    <div className="news-box">
      <div className="news-box__list">
        {posts.map((post, index) => (
          <button
            key={post.id}
            type="button"
            className={`news-box__item ${index === activeIndex ? "is-active" : ""}`}
            onClick={() => setActiveIndex(index)}
            onMouseEnter={() => setActiveIndex(index)}
            aria-pressed={index === activeIndex}
          >
            <span className="news-box__item-img sf-media">
              <MediaImage width={160} src={post.image.url} alt={post.image.alt} loading="lazy" />
            </span>
            <span className="news-box__item-body">
              <span className="news-box__item-title">{post.title}</span>
              <span className="news-box__item-text">{post.excerpt}</span>
              <span className="news-box__item-date">
                <Icon name="calendar" size={12} />
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, "en-US")}</time>
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="news-box__preview">
        <Link to={activeHref} className="news-box__preview-media sf-media">
          <MediaImage width={960} src={active.image.url} alt={active.image.alt} loading="lazy" />
          <span className="news-box__preview-category">{active.category.name}</span>
        </Link>
        <div className="news-box__preview-body">
          <h3 className="news-box__preview-title">
            <Link to={activeHref}>{active.title}</Link>
          </h3>
          <p className="news-box__preview-text">{active.excerpt}</p>
          <div className="news-box__preview-footer">
            <Link to={activeHref} className="news-box__preview-more">
              Read More
            </Link>
            <p className="news-box__preview-date mb-0">
              <Icon name="calendar" size={12} />
              <time dateTime={active.publishedAt}>{formatDate(active.publishedAt, "en-US")}</time>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewsBox;
