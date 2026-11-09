const CLOUDINARY_UPLOAD = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/(image|video)\/upload\/)(.+)$/;
const VIDEO_FILE = /\.(mp4|webm|mov)(?:[?#].*)?$/i;

// Common widths, so the same picture is not transformed at many sizes.
const WIDTHS = [160, 320, 480, 640, 960, 1280, 1920];

function snapWidth(width) {
  return WIDTHS.find((step) => step >= width) ?? WIDTHS[WIDTHS.length - 1];
}

/**
 * The URL to show an image at about `width` CSS pixels. Cloudinary uploads
 * get a size limit plus automatic format and quality; any other URL is used
 * as it is, since only Cloudinary can resize on the fly.
 */
export function imageUrl(url, { width } = {}) {
  const match = typeof url === "string" ? CLOUDINARY_UPLOAD.exec(url) : null;

  if (!match) return url;

  const [, base, resourceType, rest] = match;
  const size = width ? `c_limit,w_${snapWidth(width)}/` : "";

  // A video's URL with an image extension is a frame of it, delivered as an image.
  if (resourceType === "video" && VIDEO_FILE.test(rest)) return url;

  return `${base}${size}q_auto/f_auto/${rest}`;
}

/** A `srcSet` at 1x and 2x of `width`, or `undefined` when it cannot resize. */
export function imageSrcSet(url, width) {
  if (!width || imageUrl(url, { width }) === url) return undefined;

  return `${imageUrl(url, { width })} 1x, ${imageUrl(url, { width: width * 2 })} 2x`;
}

/** Whether a link points at a video file the page can play itself. */
export function isVideoFile(url) {
  return typeof url === "string" && VIDEO_FILE.test(url);
}

/** A Cloudinary video at automatic format and quality; other links as they are. */
export function videoUrl(url) {
  const match = typeof url === "string" ? CLOUDINARY_UPLOAD.exec(url) : null;

  if (!match || match[2] !== "video") return url;

  return `${match[1]}q_auto/f_auto/${match[3]}`;
}
