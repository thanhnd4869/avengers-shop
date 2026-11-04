import Icon from "@components/Icon";

import "./PostShare.css";

/**
 * "Share Post" links, as on the reference: each opens the network's own share
 * page, so no third-party script runs on the site.
 */
function PostShare({ title, url, image }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const links = [
    {
      network: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      network: "twitter",
      label: "Twitter",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      network: "pinterest",
      label: "Pinterest",
      href: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodeURIComponent(
        image ?? "",
      )}&description=${encodedTitle}`,
    },
  ];

  return (
    <div className="post-share rounded">
      <h2 className="post-share__label">Share Post:</h2>
      <ul className="post-share__list">
        {links.map((link) => (
          <li key={link.network}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="post-share__link"
              data-social={link.network}
              aria-label={`Share on ${link.label} (opens in a new tab)`}
            >
              <span className="post-share__icon">
                <Icon name={link.network} size={13} />
              </span>
              <span>{link.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PostShare;
