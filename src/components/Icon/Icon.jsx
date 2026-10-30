import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faCalendar,
  faCartPlus,
  faCartShopping,
  faCircleCheck,
  faComment,
  faEnvelopeOpenText,
  faEye,
  faEyeSlash,
  faGauge,
  faHeadset,
  faKey,
  faLock,
  faMagnifyingGlass,
  faRss,
  faRightFromBracket,
  faRightToBracket,
  faShieldHalved,
  faSliders,
  faStar,
  faTrashCan,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import {
  faDiscord,
  faFacebook,
  faGooglePlus,
  faInstagram,
  faTwitter,
  faSteam,
  faTwitch,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

const ICONS = {
  search: faMagnifyingGlass,
  login: faRightToBracket,
  logout: faRightFromBracket,
  user: faUser,
  gauge: faGauge,
  cart: faCartShopping,
  "cart-plus": faCartPlus,
  options: faSliders,
  calendar: faCalendar,
  comment: faComment,
  star: faStar,
  bolt: faBolt,
  shield: faShieldHalved,
  lock: faLock,
  headset: faHeadset,
  key: faKey,
  envelope: faEnvelopeOpenText,
  check: faCircleCheck,
  eye: faEye,
  "eye-slash": faEyeSlash,
  trash: faTrashCan,
  facebook: faFacebook,
  google: faGooglePlus,
  "google-plus": faGooglePlus,
  instagram: faInstagram,
  twitter: faTwitter,
  rss: faRss,
  discord: faDiscord,
  twitch: faTwitch,
  youtube: faYoutube,
  steam: faSteam,
};

function Icon({ name, size = 16, className = "", title }) {
  const icon = ICONS[name];

  if (!icon) {
    return null;
  }

  return (
    <FontAwesomeIcon
      icon={icon}
      className={className}
      title={title}
      style={{ width: size, height: size }}
    />
  );
}

export default Icon;
