import useIdentities from "@hooks/useIdentities";

import EmailSection from "./EmailSection";
import ProfileSection from "./ProfileSection";

export function Component() {
  const { identities } = useIdentities();

  return (
    <div className="account-page__sections">
      <ProfileSection />
      <EmailSection identities={identities} />
    </div>
  );
}

Component.displayName = "AccountProfilePage";
