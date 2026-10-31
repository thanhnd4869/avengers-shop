import { useState } from "react";

import "./ProductGallery.css";

/**
 * The cover followed by the screenshots: one large image and, when there is
 * more than one, a row of thumbnails that swap it.
 */
function ProductGallery({ images, badge }) {
  const [selected, setSelected] = useState(0);
  const current = images[selected] ?? images[0];

  return (
    <div className="product-gallery">
      <div className="product-gallery__main sf-media sf-ratio-3x4 rounded">
        <img src={current.url} alt={current.alt} />
        {badge}
      </div>

      {images.length > 1 ? (
        <ul className="product-gallery__thumbs list-unstyled mb-0">
          {images.map((image, index) => (
            <li key={image.url}>
              <button
                type="button"
                className={`product-gallery__thumb sf-media sf-ratio-3x4 rounded ${index === selected ? "is-active" : ""}`}
                aria-label={`Show image ${index + 1} of ${images.length}`}
                aria-pressed={index === selected}
                onClick={() => setSelected(index)}
              >
                <img src={image.url} alt="" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default ProductGallery;
