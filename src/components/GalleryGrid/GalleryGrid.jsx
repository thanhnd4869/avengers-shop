import Col from "react-bootstrap/Col";
import Placeholder from "react-bootstrap/Placeholder";
import Row from "react-bootstrap/Row";
import { Link } from "react-router";

import MediaImage from "@components/MediaImage";
import { PATHS } from "@routes/paths";

const TILE_CLASS = "d-block sf-media sf-media-zoom sf-ratio-1x1 rounded";

/**
 * Square thumbnail grid shared by the gallery section and the sidebar widget.
 *
 * Both render the same tiles at different sizes, so the column span and gutter
 * are props instead of two near-identical components.
 */
function GalleryGrid({ items, isLoading, count = 6, span = 4, gutter = "g-2" }) {
  if (isLoading) {
    return (
      <Row className={gutter}>
        {Array.from({ length: count }, (_, index) => (
          <Col key={index} xs={span}>
            <Placeholder as="div" animation="glow">
              <Placeholder className="d-block w-100 sf-ratio-1x1" />
            </Placeholder>
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Row className={gutter}>
      {items.slice(0, count).map((item) => {
        const thumb = (
          <MediaImage width={320} src={item.image.url} alt={item.image.alt} loading="lazy" />
        );
        // Screenshots may point at a full-size image on another host, which the
        // router cannot navigate to, so those stay plain anchors.
        const isExternal = /^https?:\/\//.test(item.url ?? "");

        return (
          <Col key={item.id} xs={span}>
            {isExternal ? (
              <a href={item.url} className={TILE_CLASS} target="_blank" rel="noreferrer">
                {thumb}
              </a>
            ) : (
              <Link to={item.url ?? PATHS.GALLERY} className={TILE_CLASS}>
                {thumb}
              </Link>
            )}
          </Col>
        );
      })}
    </Row>
  );
}

export default GalleryGrid;
