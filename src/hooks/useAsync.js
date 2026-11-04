import { useEffect, useState } from "react";

function shallowEqual(a, b) {
  return a.length === b.length && a.every((value, index) => Object.is(value, b[index]));
}

/**
 * Runs an async request and tracks its loading and error state.
 *
 * `deps` follows the same rules as `useEffect`: pass the values the request
 * depends on, and the request re-runs whenever one of them changes.
 */
const PENDING = { data: null, error: null, isLoading: true };

function useAsync(requestFn, deps) {
  const [state, setState] = useState(PENDING);
  const [previousDeps, setPreviousDeps] = useState(deps);

  // Resetting during render is React's documented way to adjust state when
  // inputs change. Doing it in an effect would render stale data for one frame.
  // This render still holds the old state, so it answers PENDING itself:
  // callers never see the previous inputs' result as if it were current.
  const depsChanged = !shallowEqual(previousDeps, deps);

  if (depsChanged) {
    setPreviousDeps(deps);
    setState(PENDING);
  }

  useEffect(() => {
    let cancelled = false;

    requestFn()
      .then((result) => {
        if (!cancelled) {
          setState({ data: result, error: null, isLoading: false });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ data: null, error, isLoading: false });
        }
      });

    // Ignores a response that arrives after the inputs changed or the component
    // unmounted, which would otherwise overwrite fresher state.
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return depsChanged ? PENDING : state;
}

export default useAsync;
