import DeleteAccountSection from "./DeleteAccountSection";
import PasswordSection from "./PasswordSection";

export function Component() {
  return (
    <div className="account-page__sections">
      <PasswordSection />
      <DeleteAccountSection />
    </div>
  );
}

Component.displayName = "AccountSecurityPage";
