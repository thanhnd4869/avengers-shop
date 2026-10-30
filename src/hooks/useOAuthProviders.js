import { OAUTH_PROVIDERS } from "@constants/oauth";
import useAsync from "@hooks/useAsync";
import { getOAuthProviders } from "@services/authService";

/**
 * The providers both configured on the API and known to this client, in the
 * client's order. An unreachable API simply offers none, so the email form
 * keeps working on its own.
 */
function useOAuthProviders() {
  const result = useAsync(() => getOAuthProviders(), []);
  const available = result.data ?? [];

  return {
    providers: Object.keys(OAUTH_PROVIDERS).filter((name) => available.includes(name)),
    isLoading: result.isLoading,
  };
}

export default useOAuthProviders;
