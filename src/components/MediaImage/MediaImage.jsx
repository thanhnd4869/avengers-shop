import { imageSrcSet, imageUrl } from "@utils/media";

/**
 * An `<img>` for a stored image URL. Cloudinary uploads are delivered at about
 * `width` CSS pixels (and twice that for sharp screens) in the best format and
 * quality for the browser; images hosted elsewhere are shown as they are.
 */
export default function MediaImage({ src, width, alt = "", ...props }) {
  return (
    <img src={imageUrl(src, { width })} srcSet={imageSrcSet(src, width)} alt={alt} {...props} />
  );
}
