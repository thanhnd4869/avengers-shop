import useAuth from "@hooks/useAuth";
import useIdentities from "@hooks/useIdentities";

import ConnectedAccountsSection from "./ConnectedAccountsSection";
import DeleteAccountSection from "./DeleteAccountSection";
import PasswordSection from "./PasswordSection";
import SetPasswordSection from "./SetPasswordSection";

export function Component() {
  const { user } = useAuth();
  const { identities, isLoading, setList } = useIdentities();

  return (
    <div className="account-page__sections">
      {user.hasPassword ? <PasswordSection /> : <SetPasswordSection />}
      <ConnectedAccountsSection identities={identities} isLoading={isLoading} setList={setList} />
      <DeleteAccountSection identities={identities} />
    </div>
  );
}

Component.displayName = "AccountSecurityPage";
