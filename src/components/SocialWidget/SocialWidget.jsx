import Icon from "@components/Icon";
import Widget from "@components/Widget";
import useAsync from "@hooks/useAsync";
import { getSocialLinks } from "@services/socialLinkService";

import "./SocialWidget.css";

/** "We Are Social" sidebar block: one tile per official account. */
function SocialWidget() {
  const { data, error } = useAsync(() => getSocialLinks(), []);
  const links = error ? [] : (data?.data ?? []);

  if (!links.length) {
    return null;
  }

  return (
    <Widget title="We Are Social" bodyClassName="p-0">
      <ul className="social-widget list-unstyled mb-0">
        {links.map((social) => (
          <li key={social.id}>
            <a href={social.url} aria-label={social.label} data-social={social.network}>
              <Icon name={social.network} size={18} />
            </a>
          </li>
        ))}
      </ul>
    </Widget>
  );
}

export default SocialWidget;
