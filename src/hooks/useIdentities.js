import { useCallback, useState } from "react";

import useAsync from "@hooks/useAsync";
import { getIdentities } from "@services/authService";

/**
 * The Google and Facebook accounts linked to the signed-in user. `setList`
 * applies a list the API answered after a change, without fetching again.
 */
function useIdentities() {
  const [version, setVersion] = useState(0);
  const [override, setOverride] = useState(null);
  const result = useAsync(() => getIdentities(), [version]);

  const reload = useCallback(() => {
    setOverride(null);
    setVersion((current) => current + 1);
  }, []);

  return {
    identities: override ?? result.data ?? [],
    isLoading: result.isLoading && !override,
    error: result.error,
    setList: setOverride,
    reload,
  };
}

export default useIdentities;
