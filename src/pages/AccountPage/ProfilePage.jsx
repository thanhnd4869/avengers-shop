import EmailSection from "./EmailSection";
import ProfileSection from "./ProfileSection";

export function Component() {
  return (
    <div className="account-page__sections">
      <ProfileSection />
      <EmailSection />
    </div>
  );
}

Component.displayName = "AccountProfilePage";
