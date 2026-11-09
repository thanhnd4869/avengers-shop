import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Placeholder from "react-bootstrap/Placeholder";
import { Link } from "react-router";

import MediaImage from "@components/MediaImage";
import useAsync from "@hooks/useAsync";
import { PATHS } from "@routes/paths";
import { getPlatforms } from "@services/platformService";

import "./PlatformSection.css";

const shopPlatformHref = (slug) => `${PATHS.SHOP}?platform=${slug}`;

/**
 * Three platform shortcuts. The page supplies the surrounding container.
 *
 * The shop passes the platform it is filtered by as `activeSlug`, and its own
 * `hrefFor` so a tile keeps the other filters and the active one clears.
 */
function PlatformSection({ activeSlug, hrefFor = shopPlatformHref }) {
  const { data, isLoading, error } = useAsync(() => getPlatforms(), []);

  if (isLoading) {
    return (
      <section className="platform-section mb-5" aria-label="Loading platforms">
        <Row className="gx-3 gx-lg-4 gy-3 gy-lg-0">
          {Array.from({ length: 3 }, (_, index) => (
            <Col key={index} lg={4}>
              <Placeholder as="div" animation="glow" className="platform-tile">
                <Placeholder className="platform-tile__icon-placeholder" />
                <span className="platform-tile__content">
                  <Placeholder xs={5} />
                  <Placeholder xs={8} />
                </span>
              </Placeholder>
            </Col>
          ))}
        </Row>
      </section>
    );
  }

  if (error || !data?.data.length) return null;

  return (
    <section className="platform-section mb-5">
      {/* One line at lg and up, so the vertical gutter is dropped there; its
          negative top margin would otherwise eat into the gap above. */}
      <Row className="gx-3 gx-lg-4 gy-3 gy-lg-0">
        {data.data.slice(0, 3).map((platform) => {
          const isActive = platform.slug === activeSlug;

          return (
            <Col key={platform.id} lg={4}>
              <Link
                to={hrefFor(platform.slug)}
                className={`platform-tile ${isActive ? "is-active" : ""}`}
                aria-current={isActive ? "true" : undefined}
                preventScrollReset={activeSlug !== undefined}
              >
                <span className="platform-tile__icon">
                  <MediaImage
                    width={640}
                    src={platform.image.url}
                    alt={platform.image.alt}
                    loading="lazy"
                  />
                </span>
                <span className="platform-tile__content">
                  <span className="platform-tile__name">{platform.name}</span>
                  <span className="platform-tile__cta">{isActive ? "Show all" : "View games"}</span>
                </span>
              </Link>
            </Col>
          );
        })}
      </Row>
    </section>
  );
}

export default PlatformSection;
